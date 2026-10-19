
(function () {
  var cards = JSON.parse(document.getElementById("card-data").textContent);
  var store = {};
  try { store = JSON.parse(localStorage.getItem("canon-flash") || "{}"); } catch (e) { store = {}; }
  if (!store.known) store.known = {};
  var filter = document.getElementById("fc-filter");
  var rooms = {};
  cards.forEach(function (c) { rooms[c.room] = true; });
  Object.keys(rooms).sort().forEach(function (r) {
    var o = document.createElement("option"); o.value = r; o.textContent = r; filter.appendChild(o);
  });
  var i = 0, showBack = false;
  function deck() {
    var f = filter.value;
    return cards.filter(function (c) { return !f || c.room === f; });
  }
  function save() { try { localStorage.setItem("canon-flash", JSON.stringify(store)); } catch (e) {} }
  function draw() {
    var d = deck();
    if (!d.length) return;
    if (i >= d.length) i = 0;
    var c = d[i];
    document.getElementById("fc-room").textContent = c.room;
    document.getElementById("fc-front").textContent = c.front;
    var back = document.getElementById("fc-back");
    back.hidden = !showBack;
    back.textContent = c.back;
    var known = Object.keys(store.known).filter(function (k) { return store.known[k]; }).length;
    document.getElementById("fc-meta").textContent = (i + 1) + " / " + d.length + " · " + known + " marked know";
  }
  function next(know) {
    var d = deck();
    if (!d.length) return;
    store.known[d[i].id] = !!know;
    save();
    showBack = false;
    i = (i + 1) % d.length;
    draw();
  }
  document.getElementById("flip").addEventListener("click", function () { showBack = !showBack; draw(); });
  document.getElementById("card").addEventListener("click", function () { showBack = !showBack; draw(); });
  document.getElementById("know").addEventListener("click", function () { next(true); });
  document.getElementById("again").addEventListener("click", function () { next(false); });
  filter.addEventListener("change", function () { i = 0; showBack = false; draw(); });
  document.addEventListener("keydown", function (e) {
    if (e.target && e.target.matches("input, textarea, select")) return;
    if (e.key === " ") { e.preventDefault(); showBack = !showBack; draw(); }
    if (e.key === "1") next(false);
    if (e.key === "2") next(true);
  });
  var requested = "";
  try { requested = new URLSearchParams(location.search).get("card") || ""; } catch (err) { requested = ""; }
  if (requested) {
    cards.forEach(function (c, idx) { if (c.id === requested) i = idx; });
  }
  draw();
})();
