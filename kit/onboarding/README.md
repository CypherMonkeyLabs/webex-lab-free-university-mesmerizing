# Onboarding

`tour.js` is the first-open walkthrough.

Steps are numbered 1 to 6: Home, Menu, Learn, Diagrams, Play and Listen, Downloads and the guide. Each step draws a spotlight on the real control when that control is on screen. Next, Back, and Skip are buttons. Sound is off until the visitor taps it.

Storage key `canon-tour-done`: `1` after OK on the last step, `skip` after Skip. Help uses `[data-replay-onboard]` to clear the key and open the tour again. Finishing dispatches `canon-tour-finished`, which the bot uses for the one-time greeting.
