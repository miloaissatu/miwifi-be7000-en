// Detects a MiWiFi router page by content (not hostname), then translates it live.
(function () {
  if (!window.MI_translate) return;
  const tr = window.MI_translate, has = window.MI_hasCJK;
  const ATTRS = ['placeholder', 'title', 'alt', 'value', 'data-title', 'data-tip'];
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE']);
  const seen = new Set();            // untranslated strings, logged for dictionary improvement
  const lastSet = new WeakMap();     // node -> text we wrote, to avoid reprocessing our own edits

  // Strict check: the page must load MiWiFi's own assets. Generic OpenWrt/LuCI pages never reference /xiaoqiang/web/.
  function isRouterPage() {
    if (window.MI_FORCE) return true;
    return !!document.querySelector(
      'script[src*="/xiaoqiang/web/"], link[href*="/xiaoqiang/web/"], script[src*="miwifi-monitor"], link[href*="/xiaoqiang/web/css/"]');
  }

  function fixText(node) {
    const v = node.nodeValue;
    if (!v || lastSet.get(node) === v || !has(v)) return;
    let t; try { t = tr(v); } catch (e) { return; }
    if (has(t)) { const k = t.trim(); if (!seen.has(k)) { seen.add(k); try { console.debug('[miwifi-translate] untranslated:', k); } catch (e) {} } }
    if (t !== v) { lastSet.set(node, t); node.nodeValue = t; }
  }
  function fixEl(el) {
    for (const a of ATTRS) {
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      if (a === 'value' && !(el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type))) continue;
      const v = el.getAttribute(a);
      if (v && has(v)) { const t = tr(v); if (t !== v) el.setAttribute(a, t); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { if (!SKIP.has(root.parentNode && root.parentNode.tagName)) fixText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { if (SKIP.has(root.tagName)) return; fixEl(root); }
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.nodeType === 1 && SKIP.has(n.tagName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    let n; while ((n = w.nextNode())) { if (n.nodeType === 3) fixText(n); else fixEl(n); }
  }
  function fixTitle() { if (has(document.title)) { const t = tr(document.title); if (t !== document.title) document.title = t; } }

  // English labels are wider than the Chinese ones; tighten the header nav so it does not overlap the user bar.
  function injectCss() {
    if (document.getElementById('miwifi-translate-css')) return;
    const st = document.createElement('style');
    st.id = 'miwifi-translate-css';
    st.textContent = '#nav li { margin-right: 30px !important; } #nav li a { white-space: nowrap; }';
    (document.head || document.documentElement).appendChild(st);
  }

  let started = false;
  function start() {
    if (started) return; started = true;
    injectCss();
    document.documentElement.setAttribute('data-miwifi-translate', '1'); // tells dialogs.js (page world) to translate
    const run = () => { walk(document); fixTitle(); };
    new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'childList') m.addedNodes.forEach(walk);
        else if (m.type === 'characterData') fixText(m.target);
        else if (m.type === 'attributes') fixEl(m.target);
      }
      fixTitle();
    }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    run();
    document.addEventListener('DOMContentLoaded', run);
    window.addEventListener('load', run);
  }
  // Optional user allowlist (options page). Missing setting = default "*". Storage errors fail closed.
  function hostAllowed() {
    if (window.MI_FORCE) return Promise.resolve(true);
    const api = typeof browser !== 'undefined' ? browser : null;
    if (!api || !api.storage || !window.MI_allow) return Promise.resolve(false);
    return api.storage.local.get('allowlist')
      .then(r => window.MI_allow.matches(r.allowlist, location.host, location.hostname))
      .catch(() => false);
  }
  function go() { if (!started && isRouterPage()) hostAllowed().then(ok => { if (ok) start(); }); }
  // Content may not exist yet at document_start; wait until we can identify the page.
  function tryStart() {
    if (started) return;
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', go, { once: true }); return; }
    go();
  }
  tryStart();
})();
