# Course

Rooms in this lab already follow one path: takeaways, a picture, a worked example, a quiz, and cited sources. `studio.js` adds a “Learn in 5” list from the first takeaways and a small export bar on each section (HTML, Markdown, JSON when the section is a quiz, SVG when a diagram is there, and Read).

`export-doc.mjs` builds those HTML and Markdown files with the same disclaimer and the three brand links. It does not invent PDF or DOCX bytes.

Copy the room pattern, then load `studio.js` as a module so the buttons appear.
