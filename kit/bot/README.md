# Bot

The guide that docks on the right.

| File | Role |
| --- | --- |
| `guide.js` | Monkey, poses, voice, read-along, greeting, quiet offers |
| `guide.css` | Size, glow, poses, sentence highlight |
| `engine.mjs` | Study-mode answers from the local notes only |
| `wxbot.js` | Factual lookup. This kit copy points at `../../shared/pybot-chat/engine.js`. The live page uses `guide/wxbot.js`. |

After the tour, `beginGreet` centers the monkey once (`cg-greet-done`), then it returns to the right edge. Offers wait 2.5 minutes, stop after three, and honor “Not now” and “Stop offering” (`cg-poke-off`).

This copy still imports `./engine.mjs` and loads `guide/kb` from the lab. Point those at the other lab’s notes before you rely on answers.
