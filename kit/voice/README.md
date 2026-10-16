# Voice

Voice is part of `kit/bot/guide.js`. It is not a separate engine.

- Chat read-aloud stays off until the Read button is pressed.
- The voice list prefers English voices whose names include natural, neural, enhanced, premium, or online, then a calm rate (0.92) and pitch (0.95).
- Read along speaks even when that chat toggle is off, because Read along is its own button. Pause, Resume, and Next section are buttons.
- If the browser has no `speechSynthesis`, the outline still moves and the page says so.
- The sound theme is generated in the browser (soft pad or soft rain) and stays off until the select changes. These are not recordings and not a licensed music file.
- There are no pre-recorded greeting clips in this kit.
