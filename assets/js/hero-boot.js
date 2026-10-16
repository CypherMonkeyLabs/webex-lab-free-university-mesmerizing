/* Loads the WebGL hero only on a fine pointer desktop with motion allowed.
   A static import of three.js would download and parse ~700KB on phones,
   which is the mobile Lighthouse long task. Dynamic import is the split. */
var phone = window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;
var reduce = false;
try {
  var stored = localStorage.getItem("canon-motion");
  if (stored === "reduce") reduce = true;
  else if (stored === "full") reduce = false;
  else reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
} catch (err) {
  reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
if (phone || reduce) {
  document.documentElement.dataset.hero = "flat";
  var canvas = document.querySelector("[data-world-canvas]");
  if (canvas) canvas.hidden = true;
} else {
  import("./hero-scene.js");
}
