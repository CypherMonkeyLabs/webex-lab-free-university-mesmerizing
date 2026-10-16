# Signature kit

This Webex lab is the reference for the CypherMonkey Labs chrome. Another lab can copy the folders under `kit/` and wire them the same way. `node kit/sync.mjs` refreshes those folders from the files this site actually loads, so the copy matches this build.

The live pages still load `assets/` and `guide/`. The kit is the portable copy.

## What the signature is

- Header with the Menu button on the top left.
- One banner row of sections, with arrows, that does not wrap.
- A left menu that slides in, closes with Escape, Close, or a tap outside, and hides the bot while it is open.
- The bot on the right edge: bigger, glowing, draggable on that edge. After the first tour it greets once in the middle, then docks right.
- Footer: boxed disclaimer, the line “CypherMonkey Labs”, then a glowing row with only the glasses monkey (website), the GitHub organization, and the drawn 3D Linktree mark. Copyright follows that row.
- Bot voice stays off until a button turns it on. Read along, pause, resume, and next section are buttons. A generated sound theme stays off until the visitor picks one.
- Course path: Home, then a track, then a room with takeaways, a picture, a worked example, and a quiz.
- First open: tour steps 1–6 (Home, Menu, Learn, Diagrams, Play and Listen, Downloads and the bot), with Next, Back, and Skip. The choice is stored in this browser. Help can open the tour again.

## Brand links

Only these three belong in the chrome:

- https://cyphermonkeylabs.com
- https://github.com/CypherMonkeyLabs
- https://linktr.ee/cyphermonkey

Contact is the website contact section: https://cyphermonkeylabs.com/#contact

## Folders

| Folder | Copy this for |
| --- | --- |
| `kit/chrome/` | Header, banner, left menu, phone bar, footer styles, brand icons |
| `kit/bot/` | Guide, poses, voice, read-along, right-edge dock |
| `kit/onboarding/` | The six-step tour |
| `kit/voice/` | Where voice and the sound theme live (inside the bot file) |
| `kit/course/` | Section export buttons and the learn-in-5 block |

## Wire-up

1. Copy `kit/chrome/`, `kit/bot/`, and `kit/onboarding/` into the other lab. Keep `guide/engine.mjs` beside `guide.js`, or keep the `kit/bot/` pair together and point the stylesheet and engine import at that folder.
2. Load `frame.js`, then `phone-nav.js`, then `guide.js` as a module, then `tour.js`.
3. Give every page a footer with `data-canon-footer`, the disclaimer, and the three icons. `scripts/polish_html.py` is what this lab uses to stamp that footer.
4. The bot reads `guide/kb` in this lab. Another lab should point that loader at its own notes. Leave `window.CANON_GUIDE.endpoint` null unless a cloud agent is really configured.
5. Tour storage key: `canon-tour-done` (`1` finished, `skip` skipped). Greeting key: `cg-greet-done`. Offer keys: `cg-poke-count` (max 3) and `cg-poke-off`.

## Honest limits

The kit copies this lab’s scripts. It does not include a Chrome extension, a Capacitor wrapper, or pre-recorded speech. Those are described as prepared, not built, in `docs/PUBLISHING.md`. The 3D Linktree mark is drawn in the page. It is not a file from Linktree.
