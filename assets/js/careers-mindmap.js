
(function () {
  function boot() {
    var node = document.getElementById("mindmap-data");
    var svg = document.getElementById("mindmap");
    if (!node || !svg || !window.markmap || !window.d3) return;
    window.markmap.Markmap.create(svg, null, JSON.parse(node.textContent));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
