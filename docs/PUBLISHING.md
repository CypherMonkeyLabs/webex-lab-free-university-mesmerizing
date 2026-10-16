# Publishing this lab

The site is a static folder. `npm start` serves it at http://127.0.0.1:8741/. Relative links stay inside the folder.

## Installed: progressive web app

These files are in the repository and are what a browser uses to install the lab:

- `manifest.webmanifest` — name, `start_url` `./index.html`, `scope` `./`, `display: standalone`, theme color, and 192 and 512 PNG icons in `assets/icons/`.
- `sw.js` — same-origin cache. The cache name is versioned. `assets/js/university.js` registers the worker when the page is served over http or https.
- The manifest link is added by `university.js` on each page.

To check an install prompt, serve the folder over http (not `file://`) and use the browser’s install control. This pass did not submit the site to a store.

## Prepared, not built: Chrome extension

Not done. A Manifest V3 extension would still need:

1. A `manifest.json` (extension manifest, separate from the PWA manifest) with `manifest_version: 3`, a name, and an `action` default popup or a `chrome_url_overrides` new tab.
2. Host the same static files, or point the extension at the installed PWA origin. Extension pages cannot rely on this service worker’s scope unless the files are packaged inside the extension.
3. Icons at 16, 32, 48, and 128. The PWA PNGs are not a substitute until they are copied into the sizes Chrome lists.
4. A privacy disclosure: this lab stores preferences locally and does not phone home. The extension must not add a new network call.
5. Load the unpacked folder in `chrome://extensions` and click through Menu, a room, and the guide before publishing to the Chrome Web Store.

## Prepared, not built: iOS and Android (Capacitor)

Not done. The wrapper would be a native shell around this folder.

1. `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android` in a copy of this repo, then `npx cap init` with app id `com.cyphermonkeylabs.webexlab` (that id is a suggestion, not a registered bundle).
2. `webDir` should be the repository root, or a build folder that contains `index.html`, `sw.js`, and `manifest.webmanifest`.
3. `npx cap add ios` and `npx cap add android`, then `npx cap copy`.
4. iOS needs a real Apple Developer team, a bundle id, and a decision about service workers inside `WKWebView`. Android needs a signing key.
5. Confirm speech recognition and speech synthesis on a device. The page already explains the fallback when the Web Speech API is missing.
6. This repository does not contain `ios/`, `android/`, or a Capacitor config.

## Built: embed widget

`embed/widget.js` is a small script. The host page sets `data-base` to the lab root (relative or absolute). `embed/demo.html` loads it. The card links to the lab, the CypherMonkey Labs website, the GitHub organization, and Linktree. It does not load a tracker.

```html
<script src="embed/widget.js" data-base="./"></script>
```

An SDK package (npm name, version, types) is not published. The script is the embed.
