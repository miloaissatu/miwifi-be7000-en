// Runs in the page's own JS world: translate alert/confirm/prompt text, but only on pages the content script
// has identified as the MiWiFi UI (it sets data-miwifi-translate on <html>).
(function () {
  if (!window.MI_translate) return;
  const on = () => document.documentElement && document.documentElement.hasAttribute('data-miwifi-translate');
  for (const n of ['alert', 'confirm', 'prompt']) {
    const orig = window[n];
    window[n] = function (msg, ...rest) { return orig.call(this, on() && typeof msg === 'string' ? MI_translate(msg) : msg, ...rest); };
  }
})();
