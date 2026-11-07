# MiWiFi BE7000 EN

Firefox extension that translates the Chinese Xiaomi/MiWiFi router web UI to English using a bundled dictionary (no network, no external services).

- **MiWiFi-only, any hostname**: the manifest only matches MiWiFi URL shapes (`/cgi-bin/luci/;stok=*/web/*`, `/cgi-bin/luci/web/*`, the bare `/cgi-bin/luci/` login page, `/xiaoqiang/*`, miwifi.com). Even on those, the content script does nothing unless the page loads MiWiFi's own assets (`/xiaoqiang/web/...` or `miwifi-monitor.js`), so stock OpenWrt/LuCI pages are untouched. Works on the router IP, `miwifi.com` or a custom FQDN.
- Translates text nodes, placeholders/titles/button values, `document.title`, dynamically inserted content (MutationObserver) and `alert/confirm/prompt` text.
- Engine: exact match -> longest-first phrase substitution -> unit/date rules -> punctuation cleanup.

## Host allowlist (optional)
Add-ons Manager -> MiWiFi BE7000 EN -> Preferences. One glob per line (`192.168.*`, `router.lan`, `*.lan`, optional `:port`). Default is a single `*` (any host). The content fingerprint above always applies on top; the allowlist can only restrict further. Reload router pages after saving.

## Install (temporary, until Firefox restarts)
`about:debugging#/runtime/this-firefox` -> *Load Temporary Add-on...* -> select `manifest.json`.
Permanent: sign it with Mozilla (see below), or use Firefox Developer Edition/Nightly with `xpinstall.signatures.required=false` and install the zipped folder via *Install Add-on From File...*.

## Signing for a persistent install (AMO, unlisted)
Stable Firefox only keeps add-ons that Mozilla has signed. Unlisted signing is free, automatic and usually takes minutes; occasionally it is held for manual review.

1. Create API credentials at <https://addons.mozilla.org/developers/addon/api/key/>. The *JWT issuer* looks like `user:12345678:123`; the *JWT secret* is 64 hex characters. Generating a new pair invalidates the old one.
2. Sign (needs Node/npm). Use single quotes, and keep the secret out of the repo and shell history:
   ```bash
    export WEB_EXT_API_KEY='<jwt issuer>' WEB_EXT_API_SECRET='<jwt secret>'
   npx web-ext sign --channel=unlisted
   ```
3. The signed `.xpi` is written to `web-ext-artifacts/`. Open it in Firefox (or drag it onto a window) to install it permanently.

Notes:
- `web-ext` stops waiting after about 15 minutes. The submission continues on AMO; re-run the same command later, or download the `.xpi` from <https://addons.mozilla.org/developers/addons>.
- Each release needs a higher `version` in `manifest.json`; AMO rejects a version it has already signed.
- `Error decoding signature` (401) means the issuer/secret are swapped, truncated or outdated.
- No Node? Zip the folder (`zip -r ../miwifi-be7000-en.zip . -x '.git/*'`) and upload it at <https://addons.mozilla.org/developers/addon/submit/distribution> ("On your own"), then download the signed file.
- `.xpi` files, `web-ext-artifacts/` and `.amo-upload-uuid` are git-ignored.

## Improving the dictionary
Untranslated Chinese is logged to the page console (`[miwifi-translate] untranslated: ...`, level Verbose/Debug). Add entries to `dict/extra.js` (`"中文": "English"`). Keys of 2+ chars also match as substrings; single-character keys match only a whole text node.
