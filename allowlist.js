// Host allowlist shared by content.js and the options page.
// Entries are globs ("*" matches any run of characters) tested against the page's host, with and without port.
// Default is a single "*" (no extra restriction); the content fingerprint in content.js still always applies.
(function (g) {
  const DEFAULT = ['*'];

  // Accept pasted URLs and sloppy input: strip scheme, path, userinfo; lowercase.
  function normalize(entry) {
    let e = String(entry || '').trim().toLowerCase();
    if (!e || e[0] === '#') return '';
    e = e.replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/[\/?#].*$/, '').replace(/^[^@]*@/, '');
    return /^[a-z0-9*._:\[\]-]+$/.test(e) ? e : '';
  }
  function parse(text) {
    const list = (Array.isArray(text) ? text : String(text || '').split(/[\n,]+/)).map(normalize).filter(Boolean);
    return [...new Set(list)];
  }
  function toRegex(glob) {
    return new RegExp('^' + glob.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  }
  // host = location.host ("192.168.31.1" or "router.lan:8080"); hostname = without port.
  function matches(list, host, hostname) {
    const l = parse(list);
    if (!l.length) return true; // nothing usable stored -> default behaviour
    host = String(host || '').toLowerCase();
    hostname = String(hostname || '').toLowerCase();
    return l.some(p => { const r = toRegex(p); return r.test(host) || r.test(hostname); });
  }

  g.MI_allow = { DEFAULT, parse, matches };
})(typeof window !== 'undefined' ? window : globalThis);
