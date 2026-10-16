# Course

Rooms in this lab already follow one path: takeaways, a picture, a worked example, a quiz, and cited sources. `studio.js` adds a “Learn in 5” list from the first takeaways and a small export bar on each section (HTML, Markdown, JSON when the section is a quiz, SVG when a diagram is there, and Read).

`export-doc.mjs` builds those HTML, Markdown, DOCX, and PPTX files with the same disclaimer and the three brand links. Each export ends the study notes with the room’s Sources and go deeper block, then the disclaimer. `sources-render.mjs` draws that block. A confirm row has no URL.

Copy the room pattern, then load `studio.js` as a module so the buttons appear.
