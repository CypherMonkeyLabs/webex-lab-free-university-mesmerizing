/* Visual layer: theme, dock, motion, search handoff, confetti. No network. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  function canonTheme(next) {
    if (next === "dark") return "aurora";
    if (next === "light") return "paper";
    if (next === "bloom" || next === "aurora" || next === "neon" || next === "holographic" || next === "cyberpunk" || next === "sunset" || next === "futuristic" || next === "gaming" || next === "paper" || next === "contrast") return next;
    return "bloom";
  }
  function setTheme(next) {
    root.dataset.theme = canonTheme(next);
    try { localStorage.setItem("canon-theme", root.dataset.theme); } catch (err) { /* storage off */ }
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      if (btn.hasAttribute("data-theme-lock")) return;
      var dark = root.dataset.theme !== "paper" && root.dataset.theme !== "bloom";
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.textContent = dark ? "☀️" : "🌙";
      btn.setAttribute("aria-label", dark ? "Switch to Paper" : "Switch to Aurora");
    });
  }
  setTheme(root.dataset.theme || "bloom");
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    if (btn.hasAttribute("data-theme-lock")) return;
    btn.addEventListener("click", function () {
      setTheme(root.dataset.theme === "paper" ? "aurora" : "paper");
    });
  });

  document.querySelectorAll(".nav-toggle").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close more" : "More");
      if (panel) panel.hidden = !open;
    }
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(btn.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("click", function (event) {
      if (!panel || panel.hidden) return;
      if (panel.contains(event.target) || btn.contains(event.target)) return;
      setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  });

  document.querySelectorAll(".nav-search").forEach(function (form) {
    form.addEventListener("submit", function (event) { event.preventDefault(); });
  });

  document.querySelectorAll("[data-nav-search]").forEach(function (input) {
    input.addEventListener("focus", function () {
      var cmdk = document.querySelector("[data-cmdk]");
      var cmdkInput = document.querySelector("[data-cmdk-input]");
      if (!cmdk || !cmdkInput) return;
      cmdk.hidden = false;
      cmdkInput.value = input.value || "";
      cmdkInput.dispatchEvent(new Event("input"));
      cmdkInput.focus();
    });
  });

  var tocEmoji = {
    hdr: "🏠", tldr: "✨", map: "🗺️", core: "📚", eco: "🌐", flow: "➡️",
    config: "⚙️", limits: "📏", trouble: "🔧", selfq: "❓", lab: "🧪",
    quiz: "✅", audio: "🎧", interview: "🎤", cites: "🔗", reeng: "🔁"
  };
  var toc = document.querySelector(".toc");
  if (toc) {
    toc.classList.add("section-dock");
    toc.querySelectorAll("a").forEach(function (link) {
      var id = (link.getAttribute("href") || "").replace("#", "");
      var tip = (link.textContent || "").replace(/\s+/g, " ").trim();
      if (tip) {
        link.setAttribute("data-tip", tip);
        if (!link.getAttribute("title")) link.setAttribute("title", tip);
      }
      if (tocEmoji[id] && link.querySelector(".dock-emoji") == null) {
        var mark = document.createElement("span");
        mark.className = "dock-emoji";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = tocEmoji[id];
        link.appendChild(mark);
      }
    });
  }

  document.querySelectorAll(".callout").forEach(function (box) {
    var label = box.querySelector(".label");
    var text = label ? label.textContent : "";
    if (/interview/i.test(text)) box.classList.add("interview");
    if (/exam/i.test(text)) box.classList.add("exam");
  });

  document.querySelectorAll("table").forEach(function (table) {
    var heads = Array.prototype.map.call(table.querySelectorAll("thead th"), function (th) {
      return th.textContent.trim();
    });
    if (!heads.length) return;
    table.querySelectorAll("tbody tr").forEach(function (row) {
      Array.prototype.forEach.call(row.children, function (cell, index) {
        if (!cell.getAttribute("data-label") && heads[index]) cell.setAttribute("data-label", heads[index]);
      });
    });
  });

  if (document.body.getAttribute("data-room")) {
    var bar = document.createElement("div");
    bar.className = "readbar";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var onRead = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + "%";
    };
    window.addEventListener("scroll", onRead, { passive: true });
    onRead();
  }

  var toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.textContent = "↑";
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
  document.body.appendChild(toTop);
  window.addEventListener("scroll", function () {
    toTop.classList.toggle("show", window.scrollY > 480);
  }, { passive: true });

  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = Number(el.getAttribute("data-count")) || 0;
    if (reduce) {
      el.textContent = String(target);
      return;
    }
    var start = 0;
    function tick(now) {
      if (!start) start = now;
      var t = Math.min(1, (now - start) / 900);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  if (window.CANON_INDEX) {
    var progress = {};
    try { progress = JSON.parse(localStorage.getItem("canon-progress") || "{}"); } catch (err) { progress = {}; }
    var opened = (progress && progress.rooms) || {};
    document.querySelectorAll("[data-tile-ring]").forEach(function (ring) {
      var id = ring.getAttribute("data-tile-ring");
      var track = (window.CANON_INDEX.tracks || []).filter(function (item) { return item.id === id; })[0];
      if (!track) return;
      var mine = track.rooms || [];
      var done = mine.filter(function (item) { return opened[item.code]; }).length;
      var pct = mine.length ? done / mine.length : 0;
      ring.style.strokeDashoffset = String(94.2 * (1 - pct));
    });
  }

  var riseNodes = document.querySelectorAll(".track-tile, .stat, .plan-item, .canon-visuals figure, .callout, .takeaways li, .flow-step");
  if (reduce || !("IntersectionObserver" in window)) {
    riseNodes.forEach(function (node) { node.classList.add("in"); });
  } else {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in", "rise");
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.18 });
    riseNodes.forEach(function (node) { seen.observe(node); });
  }

  document.querySelectorAll(".track-card, .qcard, .room-pager a, .glossary-card").forEach(function (node) {
    node.classList.add("lift");
  });
  if (!reduce) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateY(-3px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  function armPacket(path) {
    if (!path || path.dataset.packet === "1") return;
    var svg = path.ownerSVGElement;
    if (!svg) return;
    path.dataset.packet = "1";
    if (!path.id) path.id = "lane-" + Math.random().toString(16).slice(2);
    var ns = "http://www.w3.org/2000/svg";
    var dot = document.createElementNS(ns, "circle");
    dot.setAttribute("r", "6");
    dot.setAttribute("class", "packet");
    var motion = document.createElementNS(ns, "animateMotion");
    motion.setAttribute("dur", "3.4s");
    motion.setAttribute("repeatCount", "indefinite");
    var mpath = document.createElementNS(ns, "mpath");
    mpath.setAttribute("href", "#" + path.id);
    mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + path.id);
    motion.appendChild(mpath);
    dot.appendChild(motion);
    svg.appendChild(dot);
  }
  if (!reduce) {
    document.querySelectorAll("path.packet-lane").forEach(armPacket);
    document.querySelectorAll(".diagram svg").forEach(function (svg) {
      if (svg.querySelector(".packet-lane")) return;
      var best = null;
      var bestLen = 0;
      svg.querySelectorAll("path").forEach(function (path) {
        var d = path.getAttribute("d") || "";
        if (d.length < 12 || d.length > 160) return;
        if (/[ZzCc]/.test(d)) return;
        if (d.length > bestLen) {
          best = path;
          bestLen = d.length;
        }
      });
      if (best) armPacket(best);
    });
  } else {
    document.querySelectorAll(".flow-step").forEach(function (node) { node.classList.add("in"); });
  }

  var confettiAt = 0;
  function confetti() {
    if (reduce) return;
    var now = Date.now();
    if (now - confettiAt < 1400) return;
    confettiAt = now;
    var canvas = document.createElement("canvas");
    canvas.className = "confetti";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var colors = ["#0f9b8e", "#6366f1", "#f59e0b", "#e11d48", "#22c55e", "#c026d3", "#38bdf8"];
    var bits = [];
    for (var i = 0; i < 90; i++) {
      bits.push({
        x: canvas.width * Math.random(),
        y: -20 - Math.random() * canvas.height * 0.4,
        r: 4 + Math.random() * 5,
        v: 2 + Math.random() * 3.5,
        drift: -1.2 + Math.random() * 2.4,
        color: colors[i % colors.length],
        spin: Math.random() * 6
      });
    }
    var frames = 0;
    function frame() {
      frames += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bits.forEach(function (bit) {
        bit.y += bit.v;
        bit.x += bit.drift;
        bit.spin += 0.15;
        ctx.save();
        ctx.translate(bit.x, bit.y);
        ctx.rotate(bit.spin);
        ctx.fillStyle = bit.color;
        ctx.fillRect(-bit.r, -bit.r * 0.6, bit.r * 2, bit.r * 1.2);
        ctx.restore();
      });
      if (frames < 110) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }
  function gameState() {
    try { return JSON.parse(localStorage.getItem("canon-game") || "{}"); } catch (err) { return {}; }
  }
  function saveGame(state) {
    try { localStorage.setItem("canon-game", JSON.stringify(state)); } catch (err) { /* storage off */ }
  }
  function mountHud(anchor) {
    if (!anchor || document.querySelector(".game-hud")) return document.querySelector(".game-hud");
    var hud = document.createElement("div");
    hud.className = "game-hud";
    hud.innerHTML = '<span class="streak" data-streak>🔥 0</span><div class="xp" aria-hidden="true"><i data-xp-bar></i></div><span data-xp-label>0 XP</span><span class="emoji-pop" data-emoji aria-live="polite"></span>';
    anchor.parentNode.insertBefore(hud, anchor);
    return hud;
  }
  function renderHud() {
    var state = gameState();
    var xp = state.xp || 0;
    var streak = state.streak || 0;
    document.querySelectorAll("[data-streak]").forEach(function (el) { el.textContent = "🔥 " + streak; });
    document.querySelectorAll("[data-xp-bar]").forEach(function (el) { el.style.width = (xp % 100) + "%"; });
    document.querySelectorAll("[data-xp-label]").forEach(function (el) { el.textContent = xp + " XP"; });
  }
  function bump(opts) {
    var state = gameState();
    state.xp = (state.xp || 0) + (opts.xp || 0);
    if (opts.streak === "up") state.streak = (state.streak || 0) + 1;
    if (opts.streak === "reset") state.streak = 0;
    saveGame(state);
    renderHud();
    var pop = document.querySelector("[data-emoji]");
    if (pop) {
      pop.textContent = opts.emoji || "";
      pop.classList.remove("pop");
      void pop.offsetWidth;
      pop.classList.add("pop");
    }
    if (opts.confetti) confetti();
    if (opts.streak === "up" && state.streak && state.streak % 5 === 0) confetti();
  }
  function wrapQuizCard(card) {
    if (card.querySelector(".flip-inner")) return;
    var reveal = card.querySelector("details.reveal");
    var answer = reveal ? reveal.querySelector("p") : null;
    var scene = document.createElement("div");
    scene.className = "flip-scene";
    var inner = document.createElement("div");
    inner.className = "flip-inner";
    var front = document.createElement("div");
    front.className = "flip-face qfront";
    var back = document.createElement("div");
    back.className = "flip-face qback";
    while (card.firstChild) front.appendChild(card.firstChild);
    if (answer) {
      back.appendChild(answer);
      var backBtn = document.createElement("button");
      backBtn.type = "button";
      backBtn.className = "ghost flip-back";
      backBtn.textContent = "↩ Question";
      backBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (reveal) reveal.open = false;
      });
      back.appendChild(backBtn);
    }
    inner.appendChild(front);
    inner.appendChild(back);
    scene.appendChild(inner);
    card.appendChild(scene);
    if (reveal) {
      reveal.addEventListener("toggle", function () {
        card.classList.toggle("is-flipped", reveal.open);
      });
    }
  }
  function wrapFlash() {
    var card = document.getElementById("card");
    var front = document.getElementById("fc-front");
    var back = document.getElementById("fc-back");
    var roomLine = document.getElementById("fc-room");
    if (!card || !front || !back || card.querySelector(".flip-inner")) return;
    var scene = document.createElement("div");
    scene.className = "flip-scene";
    var inner = document.createElement("div");
    inner.className = "flip-inner";
    var faceFront = document.createElement("div");
    faceFront.className = "flip-face";
    var faceBack = document.createElement("div");
    faceBack.className = "flip-face flip-backface";
    if (roomLine) faceFront.appendChild(roomLine);
    faceFront.appendChild(front);
    faceBack.appendChild(back);
    inner.appendChild(faceFront);
    inner.appendChild(faceBack);
    scene.appendChild(inner);
    card.appendChild(scene);
    function sync() {
      var flipped = !back.hidden;
      inner.classList.toggle("is-flipped", flipped);
      card.classList.toggle("is-flipped", flipped);
    }
    if ("MutationObserver" in window) {
      new MutationObserver(sync).observe(back, { attributes: true, attributeFilter: ["hidden"] });
    }
    sync();
  }

  var quiz = document.querySelector("#quiz");
  if (quiz) {
    mountHud(quiz);
    renderHud();
    quiz.querySelectorAll(".qcard").forEach(wrapQuizCard);
    quiz.querySelectorAll("details.reveal").forEach(function (node) {
      node.addEventListener("toggle", function () {
        if (node.open) bump({ xp: 5, emoji: "✨" });
        var all = quiz.querySelectorAll("details.reveal");
        var open = quiz.querySelectorAll("details.reveal[open]");
        if (all.length && open.length === all.length) bump({ xp: 0, emoji: "🎉", confetti: true });
      });
    });
  }
  var stage = document.querySelector(".card-stage");
  if (stage) {
    mountHud(stage);
    renderHud();
    wrapFlash();
  }
  var know = document.getElementById("know");
  if (know) {
    know.addEventListener("click", function () {
      var state = gameState();
      var next = (state.streak || 0) + 1;
      bump({ xp: 10, streak: "up", emoji: next >= 3 ? "🔥" : "✅" });
      setTimeout(function () {
        var raw = document.getElementById("card-data");
        if (!raw) return;
        var cards = [];
        try { cards = JSON.parse(raw.textContent || "[]"); } catch (err) { cards = []; }
        var store = {};
        try { store = JSON.parse(localStorage.getItem("canon-flash") || "{}"); } catch (err) { store = {}; }
        var known = store.known || {};
        var filter = document.getElementById("fc-filter");
        var room = filter ? filter.value : "";
        var deck = cards.filter(function (card) { return !room || card.room === room; });
        var done = deck.filter(function (card) { return known[card.id]; }).length;
        if (deck.length && done === deck.length) confetti();
      }, 0);
    });
  }
  var again = document.getElementById("again");
  if (again) {
    again.addEventListener("click", function () {
      bump({ xp: 2, streak: "reset", emoji: "🔁" });
    });
  }

  var chipMarks = [
    [/^Room\b/i, "🚪"],
    [/^Version\b/i, "🏷️"],
    [/verified/i, "✅"],
    [/^Difficulty\b/i, "📶"],
    [/time/i, "⏱️"],
    [/^Prereq\b/i, "🔗"],
    [/^Reading\b/i, "📖"]
  ];
  document.querySelectorAll(".meta-chip").forEach(function (chip) {
    if (chip.querySelector(".chip-ico")) return;
    var text = chip.textContent || "";
    var icon = "✦";
    chipMarks.forEach(function (pair) {
      if (pair[0].test(text)) icon = pair[1];
    });
    var mark = document.createElement("span");
    mark.className = "chip-ico";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = icon;
    chip.insertBefore(mark, chip.firstChild);
  });

  var mesh = document.querySelector("[data-mesh]");
  if (mesh && !reduce && mesh.getContext) {
    var ctx = mesh.getContext("2d");
    var dots = [];
    function meshSize() {
      var parent = mesh.parentElement;
      if (!parent) return;
      var rect = parent.getBoundingClientRect();
      mesh.width = Math.max(1, Math.round(rect.width));
      mesh.height = Math.max(1, Math.round(rect.height));
    }
    meshSize();
    window.addEventListener("resize", meshSize);
    for (var i = 0; i < 42; i++) {
      dots.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0014,
        vy: (Math.random() - 0.5) * 0.0014
      });
    }
    function meshFrame() {
      if (!document.hidden) {
        var w = mesh.width;
        var h = mesh.height;
        var dark = document.documentElement.dataset.theme === "dark";
        ctx.clearRect(0, 0, w, h);
        dots.forEach(function (dot) {
          dot.x += dot.vx;
          dot.y += dot.vy;
          if (dot.x < 0 || dot.x > 1) dot.vx *= -1;
          if (dot.y < 0 || dot.y > 1) dot.vy *= -1;
        });
        ctx.lineWidth = 1;
        for (var a = 0; a < dots.length; a++) {
          for (var b = a + 1; b < dots.length; b++) {
            var dx = (dots[a].x - dots[b].x) * w;
            var dy = (dots[a].y - dots[b].y) * h;
            var dist = Math.hypot(dx, dy);
            if (dist < 110) {
              var alpha = (1 - dist / 110) * (dark ? 0.45 : 0.28);
              ctx.strokeStyle = dark ? "rgba(224,242,254," + alpha + ")" : "rgba(30,27,75," + alpha + ")";
              ctx.beginPath();
              ctx.moveTo(dots[a].x * w, dots[a].y * h);
              ctx.lineTo(dots[b].x * w, dots[b].y * h);
              ctx.stroke();
            }
          }
        }
        dots.forEach(function (dot) {
          ctx.fillStyle = dark ? "#e0f2fe" : "#312e81";
          ctx.beginPath();
          ctx.arc(dot.x * w, dot.y * h, 2.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      requestAnimationFrame(meshFrame);
    }
    requestAnimationFrame(meshFrame);
  }

  var parallax = document.querySelector("[data-parallax]");
  if (parallax && !reduce) {
    parallax.addEventListener("mousemove", function (event) {
      var rect = parallax.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      parallax.querySelectorAll("[data-depth]").forEach(function (group) {
        var depth = Number(group.getAttribute("data-depth")) || 0;
        group.setAttribute("transform", "translate(" + (x * depth * 36).toFixed(1) + " " + (y * depth * 24).toFixed(1) + ")");
      });
    });
    parallax.addEventListener("mouseleave", function () {
      parallax.querySelectorAll("[data-depth]").forEach(function (group) {
        group.removeAttribute("transform");
      });
    });
  }

  var mount = document.getElementById("glossary-mount");
  if (mount && window.CANON_INDEX && window.CANON_INDEX.terms) {
    var terms = window.CANON_INDEX.terms.slice().sort(function (a, b) {
      return a.term.localeCompare(b.term);
    });
    var count = document.querySelector("[data-glossary-count]");
    var filter = document.getElementById("glossary-q");
    function draw() {
      var q = filter ? filter.value.trim().toLowerCase() : "";
      mount.innerHTML = "";
      var shown = 0;
      terms.forEach(function (term) {
        var hay = (term.term + " " + term.def + " " + term.room).toLowerCase();
        if (q && hay.indexOf(q) === -1) return;
        shown += 1;
        var card = document.createElement("article");
        card.className = "glossary-card";
        var title = document.createElement("h3");
        title.textContent = term.term;
        var body = document.createElement("p");
        body.textContent = term.def;
        var link = document.createElement("a");
        link.href = term.href;
        link.textContent = term.room + " · open the room";
        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(link);
        mount.appendChild(card);
      });
      if (count) count.textContent = shown + " terms";
    }
    if (filter) filter.addEventListener("input", draw);
    draw();
    mountGlossaryCheck(terms);
  }
  function mountGlossaryCheck(terms) {
    var host = document.getElementById("glossary-check");
    if (!host) return;
    var pool = terms.filter(function (item) { return item && item.term && item.def; });
    if (pool.length < 2) return;
    var order = pool.slice();
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = order[i];
      order[i] = order[j];
      order[j] = swap;
    }
    var round = order.slice(0, Math.min(5, order.length));
    var step = 0;
    var revealed = false;
    var seen = 0;
    function paint() {
      var item = round[step];
      host.replaceChildren();
      var term = document.createElement("p");
      term.className = "check-term";
      term.textContent = item.term;
      var def = document.createElement("p");
      def.className = "check-def";
      def.hidden = !revealed;
      def.textContent = item.def;
      var actions = document.createElement("div");
      actions.className = "check-actions";
      var button = document.createElement("button");
      button.type = "button";
      if (!revealed) {
        button.textContent = "Show the definition";
        button.addEventListener("click", function () {
          revealed = true;
          seen += 1;
          paint();
        });
      } else if (step + 1 < round.length) {
        button.textContent = "Next term";
        button.addEventListener("click", function () {
          step += 1;
          revealed = false;
          paint();
        });
      } else {
        button.textContent = "Check five more";
        button.addEventListener("click", function () { mountGlossaryCheck(terms); });
      }
      actions.appendChild(button);
      if (item.href) {
        var room = document.createElement("a");
        room.href = item.href;
        room.textContent = item.room ? item.room : "Open the room";
        actions.appendChild(room);
      }
      var meta = document.createElement("p");
      meta.className = "check-meta";
      meta.textContent = (step + 1) + " of " + round.length + " · " + seen + " revealed";
      host.appendChild(term);
      host.appendChild(def);
      host.appendChild(actions);
      host.appendChild(meta);
    }
    paint();
  }
})();
