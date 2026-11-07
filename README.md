# MiWiFi BE7000 EN

Firefox extension that translates the Chinese Xiaomi/MiWiFi router web UI to English using a bundled dictionary (no network, no external services).

- **MiWiFi-only, any hostname**: the manifest only matches MiWiFi URL shapes (`/cgi-bin/luci/;stok=*/web/*`, `/cgi-bin/luci/web/*`, the bare `/cgi-bin/luci/` login page, `/xiaoqiang/*`, miwifi.com). Even on those, the content script does nothing unless the page loads MiWiFi's own assets (`/xiaoqiang/web/...` or `miwifi-monitor.js`), so stock OpenWrt/LuCI pages are untouched. Works on the router IP, `miwifi.com` or a custom FQDN.
- Translates text nodes, placeholders/titles/button values, `document.title`, dynamically inserted content (MutationObserver) and `alert/confirm/prompt` text.
- Engine: exact match -> longest-first phrase substitution -> unit/date rules -> punctuation cleanup.

## Host allowlist (optional)
Add-ons Manager -> MiWiFi BE7000 EN -> Preferences. One glob per line (`192.168.*`, `router.lan`, `*.lan`, optional `:port`). Default is a single `*` (any host). The content fingerprint above always applies on top; the allowlist can only restrict further. Reload router pages after saving.

## Install (temporary, until Firefox restarts)
`about:debugging#/runtime/this-firefox` -> *Load Temporary Add-on...* -> select `manifest.json`.
Permanent: sign via AMO (unlisted) or use Firefox Developer/Nightly with `xpinstall.signatures.required=false`.

## Improving the dictionary
Untranslated Chinese is logged to the page console (`[miwifi-translate] untranslated: ...`, level Verbose/Debug). Add entries to `dict/extra.js` (`"中文": "English"`). Keys of 2+ chars also match as substrings; single-character keys match only a whole text node.
