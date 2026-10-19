
(function () {
  var drills = JSON.parse(document.getElementById("drill-data").textContent);
  var store = {};
  try { store = JSON.parse(localStorage.getItem("canon-drills") || "{}"); } catch (e) { store = {}; }
  var root = document.getElementById("drills");
  function save() { try { localStorage.setItem("canon-drills", JSON.stringify(store)); } catch (e) {} }
  function score() {
    var n = drills.filter(function (d) { return store[d.id]; }).length;
    document.getElementById("drill-score").textContent = n + " of " + drills.length + " answered on this browser.";
  }
  drills.forEach(function (d) {
    var art = document.createElement("article");
    art.className = "qcard";
    art.innerHTML = "<header><strong>" + d.title + "</strong></header><p>" + d.story + "</p>";
    var box = document.createElement("div");
    d.choices.forEach(function (c, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ghost choice";
      b.textContent = c.t;
      b.addEventListener("click", function () {
        store[d.id] = idx;
        save();
        var note = document.createElement("p");
        note.className = "why";
        note.textContent = (c.ok ? "This choice matches the cited articles. " : "This choice conflicts with the cited articles. ") + c.why;
        var old = art.querySelector(".why");
        if (old) old.remove();
        art.appendChild(note);
        score();
      });
      box.appendChild(b);
    });
    art.appendChild(box);
    root.appendChild(art);
  });
  score();
})();
