/* Canon v4 shell: sidebar, search, palette, themes, media mounts, motion.
   Reads data/media.json over http. file:// falls back to data/media.js.
   Does not invent room media. An empty catalog renders nothing. */
(function () {
  window.CANON_SHELL_MEDIA = true;
  var root = document.documentElement;
  try {
    var storedMotion = localStorage.getItem("canon-motion");
    if (storedMotion === "reduce" || storedMotion === "full") root.dataset.motion = storedMotion;
  } catch (err) { /* storage off */ }
  var reduce = root.dataset.motion === "reduce" || (root.dataset.motion !== "full" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var fine = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(hover: none)").matches;
  var touch = window.matchMedia("(pointer: coarse)").matches;
  if (!reduce) root.classList.add("v4-motion");

  var THEMES = [
    ["aurora", "Aurora", "Night"],
    ["neon", "Neon", "Night"],
    ["holographic", "Holographic", "Night"],
    ["cyberpunk", "Cyberpunk", "Night"],
    ["sunset", "Sunset", "Night"],
    ["futuristic", "Futuristic", "Night"],
    ["gaming", "Gaming", "Night"],
    ["paper", "Light", "Paper"]
  ];
  var THEME_NAMES = THEMES.map(function (item) { return item[0]; });

  function canonTheme(next) {
    if (next === "dark") return "aurora";
    if (next === "light") return "paper";
    if (THEME_NAMES.indexOf(next) !== -1) return next;
    return "aurora";
  }
  function applyTheme(next) {
    next = canonTheme(next);
    root.dataset.theme = next;
    try { localStorage.setItem("canon-theme", next); } catch (err) { /* storage off */ }
    document.querySelectorAll("[data-set-theme]").forEach(function (btn) {
      btn.setAttribute("aria-checked", btn.getAttribute("data-set-theme") === next ? "true" : "false");
    });
    document.dispatchEvent(new CustomEvent("canon-theme", { detail: { theme: next } }));
  }
  applyTheme(root.dataset.theme || "aurora");

  function prefix() {
    var nodes = document.querySelectorAll("script[src]");
    var mark = "assets/js/search-index.js";
    for (var i = 0; i < nodes.length; i++) {
      var src = nodes[i].getAttribute("src") || "";
      var at = src.indexOf(mark);
      if (at !== -1) return src.slice(0, at);
    }
    return "";
  }
  var rootPrefix = prefix();

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function fromRoot(href) {
    if (!href) return "";
    if (/^(https?:|mailto:|#)/.test(href)) return href;
    return rootPrefix + String(href).replace(/^\//, "");
  }

  var ICONS = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
    home: '<path d="M4 11 12 4l8 7v9H4z"/>',
    start: '<path d="M12 3v10M8 7l4-4 4 4"/><path d="M5 21h14M7 21v-4h10v4"/>',
    check: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12.5 11 15l4.5-5"/>',
    cards: '<rect x="4" y="6" width="12" height="14" rx="2"/><path d="M8 4h10a2 2 0 0 1 2 2v12"/>',
    flask: '<path d="M9 3h6M10 3v6L5 19a3 3 0 0 0 3 2h8a3 3 0 0 0 3-2l-5-10V3"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/>',
    book: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5z"/><path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H20"/>',
    globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.5 2.5 13 0 16M12 4c-2.5 2.5-2.5 13 0 16"/>',
    wrench: '<path d="M14.5 6.5a3.5 3.5 0 0 0-4.8 4.8L4 17l3 3 5.7-5.7a3.5 3.5 0 0 0 4.8-4.8L15 12l-3-3z"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    spark: '<path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8z"/>',
    flow: '<path d="M5 7h6M5 12h10M5 17h8"/><path d="M14 5l3 2-3 2M18 10l3 2-3 2M16 15l3 2-3 2"/>',
    sliders: '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="10" cy="17" r="2"/>',
    ruler: '<path d="M4 8h16v8H4z"/><path d="M8 8v3M12 8v4M16 8v3"/>',
    help: '<circle cx="12" cy="12" r="8"/><path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.9-1.2 1.6V14"/><path d="M12 17h.01"/>',
    audio: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.2-5.5"/><path d="M20 4v5h-5"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="m8 15 2.5-3 2 2.5L15 11l3 4"/>',
    collapse: '<path d="M15 6 9 12l6 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    hub: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    phone: '<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M11 18h2"/>',
    headset: '<path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v5h3v-5M20 13v5h-3v-5"/>',
    building: '<path d="M4 20h16M6 20V6h8v14M14 10h4v10"/><path d="M8 9h2M8 12h2M8 15h2"/>',
    lock: '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    truck: '<path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/>',
    radio: '<path d="M5 15a7 7 0 0 1 14 0"/><path d="M8 15a4 4 0 0 1 8 0"/><circle cx="12" cy="15" r="1"/>',
    swatch: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>'
  };
  var TRACK_ICON = { T1: "hub", T2: "phone", T3: "headset", T4: "building", T5: "lock", T6: "truck", T7: "radio", T8: "spark" };
  var SHORT = {
    T1: "Control Hub",
    T2: "Calling",
    T3: "WxCC",
    T4: "WxCC Enterprise",
    T5: "Dedicated Instance",
    T6: "Migrations",
    T7: "SIP & Queues",
    T8: "Flows & Tools"
  };
  var SECTION_ICON = {
    hdr: "home", tldr: "spark", map: "map", core: "book", eco: "globe", flow: "flow",
    config: "sliders", limits: "ruler", trouble: "wrench", selfq: "help", lab: "flask",
    quiz: "check", audio: "audio", interview: "mic", cites: "link", reeng: "refresh", media: "image"
  };

  function icon(name) {
    return '<svg class="v4-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.spark) + "</svg>";
  }

  function ensureShell() {
    if (document.getElementById("v4-sidebar")) return;
    var app = document.createElement("div");
    app.className = "v4-app";
    var sidebar = document.createElement("aside");
    sidebar.id = "v4-sidebar";
    sidebar.className = "v4-sidebar";
    sidebar.setAttribute("data-sidebar", "");
    var stage = document.createElement("div");
    stage.className = "v4-stage";
    var toc = document.createElement("aside");
    toc.id = "v4-toc";
    toc.className = "v4-toc";
    toc.setAttribute("aria-label", "On this page");
    var keep = [];
    Array.prototype.forEach.call(document.body.childNodes, function (node) {
      if (node.nodeType === 1 && (node.tagName === "SCRIPT" || node.classList.contains("skip"))) return;
      keep.push(node);
    });
    keep.forEach(function (node) { stage.appendChild(node); });
    stage.appendChild(toc);
    app.appendChild(sidebar);
    app.appendChild(stage);
    document.body.appendChild(app);
  }
  document.body.classList.add("v4");
  ensureShell();

  var sidebar = document.getElementById("v4-sidebar");
  var stage = document.querySelector(".v4-stage");
  var tocRail = document.getElementById("v4-toc");
  if (sidebar) {
    sidebar.setAttribute("aria-label", "Canon navigation");
  }

  function openedMap() {
    try {
      var progress = JSON.parse(localStorage.getItem("canon-progress") || "{}");
      return (progress && progress.rooms) || {};
    } catch (err) {
      return {};
    }
  }

  var TOOLS = [
    ["index.html", "home", "Home", ""],
    ["start.html", "start", "Start Here", ""],
    ["quizzes.html", "check", "Practice Quiz", ""],
    ["flashcards.html", "cards", "Flashcards", ""],
    ["labs.html", "flask", "Hands-on Labs", ""],
    ["interviews.html", "mic", "Interview Prep", ""],
    ["glossary.html", "book", "Glossary", ""],
    ["ecosystem.html", "globe", "Ecosystem Map", ""],
    ["ecosystem-atlas.html", "globe", "Ecosystem Atlas", ""],
    ["mastery.html", "map", "Mastery Map", ""],
    ["ports.html", "radio", "Ports & Protocols", ""],
    ["diagrams.html", "image", "Diagrams", ""],
    ["flows.html", "flow", "Flows", ""],
    ["charts.html", "sliders", "Charts", ""],
    ["downloads.html", "cards", "Cheat Codes", ""],
    ["play.html", "spark", "Play Lab", ""],
    ["careers.html", "mic", "Careers", ""],
    ["drills.html", "wrench", "Troubleshooting Cases", ""],
    ["archive/webex-lab-v1/campus/index.html", "flask", "Archive Studio", ""]
  ];

  function hereFile() {
    var path = location.pathname || "";
    var file = path.split("/").pop() || "index.html";
    if (!file || file.slice(-5) !== ".html") return "index.html";
    return file;
  }

  function renderSidebar() {
    if (!sidebar) return;
    var index = window.CANON_INDEX;
    var opened = openedMap();
    var current = document.body.getAttribute("data-room") || "";
    var trackId = document.body.getAttribute("data-track") || "";
    var file = hereFile();
    var tools = TOOLS.map(function (item) {
      var currentPage = file === item[0] ? ' aria-current="page"' : "";
      return '<a class="v4-tool" href="' + esc(fromRoot(item[0])) + '"' + currentPage + ">" + icon(item[1]) + '<span class="v4-label">' + esc(item[2]) + "</span></a>";
    }).join("");
    var tracks = "";
    if (index && index.tracks) {
      tracks = index.tracks.map(function (track, indexNo) {
        var rooms = track.rooms || [];
        var done = rooms.filter(function (room) { return opened[room.code]; }).length;
        var open = track.id === trackId || (!trackId && indexNo === 0 && file.indexOf("index") === 0);
        var roomHtml = rooms.map(function (room) {
          var on = opened[room.code] ? " is-on" : "";
          var cur = room.code === current ? ' aria-current="page"' : "";
          var href = room.href ? fromRoot(room.href) : fromRoot("tracks/" + track.id + "/index.html");
          return '<li><a class="v4-room-link" href="' + esc(href) + '"' + cur + '><i class="v4-dot' + on + '" aria-hidden="true"></i><span>' + esc(room.title) + "</span></a></li>";
        }).join("");
        return '<section class="v4-track' + (open ? " is-open" : "") + '" style="--track:' + esc(track.color || "var(--accent)") + '">' +
          '<button type="button" class="v4-track-btn" aria-expanded="' + (open ? "true" : "false") + '">' +
          '<span class="v4-num">' + String(indexNo + 1).padStart(2, "0") + "</span>" +
          icon(TRACK_ICON[track.id] || "spark") +
          '<span class="v4-track-name v4-label">' + esc(SHORT[track.id] || track.name) + "</span>" +
          '<span class="v4-count v4-label">' + done + "/" + rooms.length + "</span>" +
          icon("chevron") +
          "</button><ol class=\"v4-rooms\">" + roomHtml + "</ol></section>";
      }).join("");
    }
    sidebar.innerHTML =
      '<div class="v4-side-head"><a class="v4-wordmark" href="' + esc(fromRoot("index.html")) + '">Canon<small>8 tracks</small></a>' +
      '<button type="button" class="icon-btn" data-nav-toggle aria-label="Collapse sidebar">' + icon("collapse") + "</button></div>" +
      '<nav class="v4-side-tools" aria-label="Study tools">' + tools + "</nav>" +
      '<p class="v4-kicker">Tracks</p><div class="v4-tracks">' + tracks + "</div>";
    sidebar.querySelectorAll(".v4-track-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (root.dataset.sidebar === "collapsed" && window.matchMedia("(min-width: 961px)").matches) {
          root.dataset.sidebar = "open";
          try { localStorage.setItem("canon-sidebar", "open"); } catch (err) { /* storage off */ }
        }
        var section = btn.parentNode;
        var open = section.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }
  renderSidebar();

  var backdrop = document.createElement("div");
  backdrop.className = "v4-backdrop";
  backdrop.hidden = true;
  backdrop.setAttribute("data-backdrop", "");
  document.body.appendChild(backdrop);

  function drawerOpen(open) {
    root.dataset.drawer = open ? "open" : "closed";
    backdrop.hidden = !open;
    document.querySelectorAll("[data-menu]").forEach(function (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
  }
  function toggleNav() {
    if (window.matchMedia("(max-width: 960px)").matches || document.body.classList.contains("home-world")) {
      drawerOpen(root.dataset.drawer !== "open");
      return;
    }
    var collapsed = root.dataset.sidebar === "collapsed";
    root.dataset.sidebar = collapsed ? "open" : "collapsed";
    try { localStorage.setItem("canon-sidebar", collapsed ? "open" : "collapsed"); } catch (err) { /* storage off */ }
  }
  backdrop.addEventListener("click", function () { drawerOpen(false); });
  document.querySelectorAll("[data-nav-toggle]").forEach(function (btn) {
    btn.addEventListener("click", toggleNav);
  });

  var header = document.querySelector(".topbar");
  if (header && header.querySelector(".bar-inner")) {
    header.classList.add("v4-glow");
    var bar = header.querySelector(".bar-inner");
    var menu = document.createElement("button");
    menu.type = "button";
    menu.className = "icon-btn v4-menu";
    menu.setAttribute("data-menu", "");
    menu.setAttribute("aria-controls", "v4-sidebar");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
    menu.innerHTML = icon("menu");
    menu.addEventListener("click", toggleNav);
    bar.insertBefore(menu, bar.firstChild);

    document.querySelectorAll("[data-nav-search]").forEach(function (input) {
      var fresh = input.cloneNode(true);
      fresh.setAttribute("placeholder", "Search rooms, glossary, flashcards, quiz");
      fresh.setAttribute("aria-label", "Search rooms, glossary, flashcards, and the practice quiz");
      fresh.setAttribute("role", "combobox");
      fresh.setAttribute("aria-autocomplete", "list");
      fresh.setAttribute("aria-expanded", "false");
      fresh.setAttribute("aria-controls", "v4-suggest");
      input.replaceWith(fresh);
      var form = fresh.form || fresh.parentNode;
      if (form && !form.querySelector(".v4-kbd-btn")) {
        var kbd = document.createElement("button");
        kbd.type = "button";
        kbd.className = "v4-kbd-btn";
        kbd.setAttribute("data-palette-open", "");
        kbd.textContent = /Mac|iPhone|iPad/.test(navigator.platform || "") ? "⌘K" : "Ctrl K";
        form.appendChild(kbd);
      }
      if (form && !document.getElementById("v4-suggest")) {
        var list = document.createElement("ul");
        list.id = "v4-suggest";
        list.className = "v4-suggest";
        list.hidden = true;
        list.setAttribute("role", "listbox");
        form.appendChild(list);
      }
      bindSearch(fresh, document.getElementById("v4-suggest"), false);
    });

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var fresh = btn.cloneNode(false);
      fresh.type = "button";
      fresh.className = "icon-btn";
      fresh.setAttribute("data-theme-toggle", "");
      fresh.setAttribute("data-theme-lock", "");
      fresh.setAttribute("aria-haspopup", "menu");
      fresh.setAttribute("aria-label", "Choose a theme");
      fresh.innerHTML = icon("swatch");
      btn.replaceWith(fresh);
      fresh.addEventListener("click", function (event) {
        event.stopPropagation();
        themePop.hidden = !themePop.hidden;
      });
    });

    var helpBtn = document.createElement("button");
    helpBtn.type = "button";
    helpBtn.className = "icon-btn";
    helpBtn.setAttribute("aria-label", "Keyboard shortcuts");
    helpBtn.setAttribute("data-help-open", "");
    helpBtn.textContent = "?";
    var anchor = header.querySelector("[data-theme-toggle]");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(helpBtn, anchor.nextSibling);
    else bar.appendChild(helpBtn);

    var sub = document.createElement("div");
    sub.className = "v4-subbar";
    sub.innerHTML = '<nav class="v4-crumbs" aria-label="Breadcrumb"></nav><div class="v4-jumps" data-room-nav></div>';
    header.appendChild(sub);
  }

  var read = document.createElement("div");
  read.className = "v4-read";
  read.setAttribute("aria-hidden", "true");
  read.innerHTML = "<i></i>";
  if (stage) stage.insertBefore(read, stage.firstChild);

  function flatRooms() {
    var list = [];
    var index = window.CANON_INDEX;
    if (!index) return list;
    index.tracks.forEach(function (track) {
      (track.rooms || []).forEach(function (room) {
        if (room.href) list.push({ code: room.code, title: room.title, href: room.href, track: track.id, trackName: SHORT[track.id] || track.name });
      });
    });
    return list;
  }
  var roomList = flatRooms();
  function neighbor(delta) {
    var code = document.body.getAttribute("data-room");
    if (!code) return null;
    var at = -1;
    roomList.forEach(function (room, index) { if (room.code === code) at = index; });
    if (at < 0) return null;
    return roomList[at + delta] || null;
  }
  function jumpLink(room, dir) {
    if (!room) return "";
    return '<a class="v4-jump v4-mag" rel="' + dir + '" href="' + esc(fromRoot(room.href)) + '"><span>' + (dir === "prev" ? "Previous" : "Next") + "</span><strong>" + esc(room.code) + " · " + esc(room.title) + "</strong></a>";
  }
  function paintCrumbs() {
    var nav = document.querySelector(".v4-crumbs");
    if (!nav) return;
    var parts = [{ href: fromRoot("index.html"), label: "Home" }];
    var track = document.body.getAttribute("data-track") || "";
    var room = document.body.getAttribute("data-room") || "";
    var title = document.body.getAttribute("data-room-title") || "";
    if (!track) {
      var match = (location.pathname || "").match(/\/tracks\/(T\d)\//);
      if (match) track = match[1];
    }
    if (track) parts.push({ href: fromRoot("tracks/" + track + "/index.html"), label: SHORT[track] || track });
    if (room) parts.push({ label: title || room });
    else if (hereFile() !== "index.html") {
      var h1 = document.querySelector("main h1");
      parts.push({ label: h1 ? h1.textContent.replace(/\s+/g, " ").trim() : hereFile() });
    }
    nav.innerHTML = parts.map(function (part, index) {
      var last = index === parts.length - 1;
      var chunk = last || !part.href
        ? '<span aria-current="page">' + esc(part.label) + "</span>"
        : '<a href="' + esc(part.href) + '">' + esc(part.label) + "</a>";
      return (index ? "<span aria-hidden=\"true\">/</span>" : "") + chunk;
    }).join("");
    var jumps = document.querySelector("[data-room-nav]");
    if (!jumps) return;
    if (!room) { jumps.innerHTML = ""; return; }
    jumps.innerHTML = jumpLink(neighbor(-1), "prev") + jumpLink(neighbor(1), "next");
    var pager = document.querySelector(".room-pager");
    if (!pager && (neighbor(-1) || neighbor(1))) {
      pager = document.createElement("nav");
      pager.className = "room-pager";
      pager.setAttribute("aria-label", "Adjacent rooms");
      var host = document.querySelector(".room-main") || document.querySelector("main");
      if (host) host.appendChild(pager);
    }
    if (pager) {
      if (!pager.querySelector(".prev") && neighbor(-1)) pager.insertAdjacentHTML("afterbegin", '<a class="prev" href="' + esc(fromRoot(neighbor(-1).href)) + '"><span>Previous</span><strong>' + esc(neighbor(-1).code) + "</strong><em>" + esc(neighbor(-1).title) + "</em></a>");
      if (!pager.querySelector(".next") && neighbor(1)) pager.insertAdjacentHTML("beforeend", '<a class="next" href="' + esc(fromRoot(neighbor(1).href)) + '"><span>Next</span><strong>' + esc(neighbor(1).code) + "</strong><em>" + esc(neighbor(1).title) + "</em></a>");
    }
  }
  paintCrumbs();

  function catalog() {
    var rows = [];
    TOOLS.forEach(function (item) {
      rows.push({ kind: "Page", icon: item[1], title: item[2], href: fromRoot(item[0]), hay: item[2].toLowerCase(), note: "" });
    });
    roomList.forEach(function (room) {
      rows.push({ kind: "Room", icon: TRACK_ICON[room.track] || "book", title: room.code + " · " + room.title, href: fromRoot(room.href), hay: (room.code + " " + room.title + " " + room.trackName).toLowerCase(), note: room.trackName });
    });
    ((window.CANON_INDEX && window.CANON_INDEX.terms) || []).forEach(function (term) {
      rows.push({ kind: "Glossary", icon: "book", title: term.term, href: fromRoot(term.href || ""), hay: (term.term + " " + (term.def || "") + " " + (term.room || "")).toLowerCase(), note: term.room || "" });
    });
    var study = window.CANON_STUDY || {};
    (study.cards || []).forEach(function (card) {
      rows.push({ kind: "Flashcards", icon: "cards", title: card[1], href: fromRoot("flashcards.html?card=" + encodeURIComponent(card[0])), hay: (card[1] + " " + card[2] + " " + card[0]).toLowerCase(), note: card[2] });
    });
    (study.quiz || []).forEach(function (item) {
      rows.push({ kind: "Practice Quiz", icon: "check", title: item[1], href: fromRoot("quizzes.html#" + encodeURIComponent(item[0])), hay: (item[0] + " " + item[1]).toLowerCase(), note: item[0] });
    });
    return rows;
  }
  var allRows = catalog();
  function searchRows(query) {
    var q = (query || "").trim().toLowerCase();
    if (!q) return allRows.filter(function (row) { return row.kind === "Page"; }).slice(0, 9);
    var kindRank = { Room: 0, Page: 1, Glossary: 2, Flashcards: 3, "Practice Quiz": 4 };
    var hits = [];
    for (var i = 0; i < allRows.length; i++) {
      var row = allRows[i];
      var at = row.hay.indexOf(q);
      if (at === -1) continue;
      var title = row.title.toLowerCase();
      var titleAt = title.indexOf(q);
      var score = (kindRank[row.kind] == null ? 5 : kindRank[row.kind]) * 10;
      if (titleAt === 0) score -= 6;
      else if (titleAt > 0) score -= 3;
      else score += 8;
      if (row.kind === "Room" && titleAt !== -1) score -= 8;
      hits.push({ row: row, score: score, at: at });
    }
    hits.sort(function (a, b) { return a.score - b.score || a.at - b.at; });
    var caps = { Room: 4, Page: 2, Glossary: 3, Flashcards: 3, "Practice Quiz": 3 };
    var counts = {};
    var picked = [];
    hits.forEach(function (hit) {
      if (picked.length >= 12) return;
      var kind = hit.row.kind;
      counts[kind] = counts[kind] || 0;
      if (counts[kind] >= (caps[kind] || 3)) return;
      counts[kind] += 1;
      picked.push(hit.row);
    });
    return picked;
  }
  function paintHits(list, hits, active) {
    if (!list) return;
    list.innerHTML = "";
    if (!hits.length) {
      list.innerHTML = '<li><span class="v4-hit-title">Nothing matches that search.</span></li>';
      return;
    }
    hits.forEach(function (hit, index) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      if (index === active) li.setAttribute("aria-selected", "true");
      var a = document.createElement("a");
      a.href = hit.href || "#";
      a.innerHTML = icon(hit.icon) + '<span class="v4-kind">' + esc(hit.kind) + '</span><span class="v4-hit-title">' + esc(hit.title) + "</span>";
      if (hit.note) {
        var note = document.createElement("small");
        note.textContent = hit.note;
        a.appendChild(note);
      }
      li.appendChild(a);
      list.appendChild(li);
    });
    list._hits = hits;
    list._active = active;
  }

  function bindSearch(input, list, modal) {
    var state = { active: 0, hits: [] };
    function show(q) {
      state.hits = searchRows(q);
      if (state.active >= state.hits.length) state.active = 0;
      paintHits(list, state.hits, state.active);
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }
    input.addEventListener("focus", function () { show(input.value); });
    input.addEventListener("input", function () { state.active = 0; show(input.value); });
    input.addEventListener("keydown", function (event) {
      if (list.hidden) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        event.stopImmediatePropagation();
        var n = state.hits.length;
        if (!n) return;
        state.active = event.key === "ArrowDown" ? (state.active + 1) % n : (state.active - 1 + n) % n;
        paintHits(list, state.hits, state.active);
      }
      if (event.key === "Enter" && state.hits[state.active] && state.hits[state.active].href) {
        event.preventDefault();
        location.href = state.hits[state.active].href;
      }
      if (event.key === "Escape") {
        list.hidden = true;
        input.setAttribute("aria-expanded", "false");
        if (modal) palette.hidden = true;
      }
    });
    if (!modal && input.form) {
      input.form.addEventListener("submit", function (event) { event.preventDefault(); });
    }
  }

  var palette = document.createElement("div");
  palette.className = "v4-palette";
  palette.hidden = true;
  palette.innerHTML = '<div class="v4-palette-panel v4-glow" role="dialog" aria-modal="true" aria-label="Command palette"><input data-palette-input type="search" placeholder="Search rooms, glossary, flashcards, quiz" aria-label="Command palette" autocomplete="off"><ul class="v4-palette-list" data-palette-list role="listbox"></ul><p class="v4-hint"><kbd>↑</kbd> <kbd>↓</kbd> move · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</p></div>';
  document.body.appendChild(palette);
  var paletteInput = palette.querySelector("[data-palette-input]");
  var paletteList = palette.querySelector("[data-palette-list]");
  bindSearch(paletteInput, paletteList, true);
  var paletteReturn = null;
  function openPalette() {
    paletteReturn = document.activeElement;
    palette.hidden = false;
    paletteInput.value = "";
    paletteInput.focus();
    paletteInput.dispatchEvent(new Event("input"));
  }
  function closePalette() {
    palette.hidden = true;
    if (paletteReturn && paletteReturn.focus) paletteReturn.focus();
  }
  document.querySelectorAll("[data-palette-open]").forEach(function (btn) {
    btn.addEventListener("click", function () { openPalette(); });
  });
  palette.addEventListener("click", function (event) { if (event.target === palette) closePalette(); });

  var help = document.createElement("div");
  help.className = "v4-help";
  help.hidden = true;
  help.innerHTML = '<div class="v4-help-panel v4-glow" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><h2>Keyboard shortcuts</h2><ul><li><kbd>Ctrl</kbd> <kbd>K</kbd> or <kbd>⌘</kbd> <kbd>K</kbd> Command palette</li><li><kbd>?</kbd> This list</li><li><kbd>[</kbd> <kbd>]</kbd> Previous and next room</li><li><kbd>Esc</kbd> Close a panel</li></ul><button type="button" class="ghost" data-help-close>Close</button></div>';
  document.body.appendChild(help);
  function openHelp() { help.hidden = false; help.querySelector("button").focus(); }
  function closeHelp() { help.hidden = true; }
  document.querySelectorAll("[data-help-open]").forEach(function (btn) {
    btn.addEventListener("click", openHelp);
  });
  help.querySelector("[data-help-close]").addEventListener("click", closeHelp);
  help.addEventListener("click", function (event) { if (event.target === help) closeHelp(); });

  var themePop = document.createElement("div");
  themePop.className = "theme-pop";
  themePop.hidden = true;
  themePop.innerHTML = '<div class="theme-menu" role="menu" aria-label="Theme">' + THEMES.map(function (item) {
    return '<button type="button" role="menuitemradio" data-set-theme="' + item[0] + '" aria-checked="false"><i class="swatch ' + item[0] + '"></i><span>' + item[1] + '</span><small>' + item[2] + "</small></button>";
  }).join("") + "</div>";
  document.body.appendChild(themePop);
  applyTheme(root.dataset.theme);
  themePop.querySelectorAll("[data-set-theme]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(btn.getAttribute("data-set-theme"));
      themePop.hidden = true;
    });
  });
  document.addEventListener("click", function (event) {
    if (themePop.hidden) return;
    if (themePop.contains(event.target) || (event.target.closest && event.target.closest("[data-theme-toggle]"))) return;
    themePop.hidden = true;
  });

  document.addEventListener("keydown", function (event) {
    var key = event.key;
    var typing = event.target && event.target.closest && event.target.closest("input, textarea, select, [contenteditable]");
    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === "k") {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (palette.hidden) openPalette(); else closePalette();
      return;
    }
    if (!typing && !event.ctrlKey && !event.metaKey && !event.altKey && key === "?") {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (help.hidden) openHelp(); else closeHelp();
      return;
    }
    if (!palette.hidden || !help.hidden || root.dataset.drawer === "open") {
      if (key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closePalette();
        closeHelp();
        drawerOpen(false);
        themePop.hidden = true;
        return;
      }
    }
    if (!typing && (key === "[" || key === "]")) {
      var hop = neighbor(key === "[" ? -1 : 1);
      if (hop) {
        event.preventDefault();
        location.href = fromRoot(hop.href);
      }
    }
  }, true);

  function cloakEditorial(scope) {
    scope.querySelectorAll("mark.todo-verify, mark.recheck, .badge.draft").forEach(function (el) {
      el.dataset.editorial = (el.textContent || "").trim();
      el.hidden = true;
    });
    scope.querySelectorAll(".meta-chip").forEach(function (chip) {
      var text = (chip.textContent || "").replace(/\s+/g, " ").trim();
      if (/^(Draft|Study notes)$/.test(text) || /^v0\.\d+$/.test(text) || /last-verified/i.test(text) || /TODO-verify|Phase\s*0|Pass\s+\d+/.test(text)) {
        chip.dataset.editorial = text;
        chip.hidden = true;
      }
    });
    scope.querySelectorAll(".site-footer span, .room-pager .edge").forEach(function (el) {
      if (/draft|not verified|TODO-verify|Phase\s*0|Pass\s+\d+/i.test(el.textContent || "")) {
        el.dataset.editorial = (el.textContent || "").trim();
        el.hidden = true;
      }
    });
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        var tag = node.parentElement.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA") return NodeFilter.FILTER_REJECT;
        if (node.parentElement.closest("script, style, [data-editorial]")) return NodeFilter.FILTER_REJECT;
        if (!/TODO-verify|Phase\s*0|Pass\s+\d+/.test(node.nodeValue || "")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var re = /\b(?:TODO-verify|Phase\s*0|Pass\s+\d+)\b/g;
    nodes.forEach(function (node) {
      var text = node.nodeValue || "";
      var frag = document.createDocumentFragment();
      var last = 0;
      var match;
      re.lastIndex = 0;
      while ((match = re.exec(text))) {
        frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        var span = document.createElement("span");
        span.dataset.editorial = match[0];
        span.hidden = true;
        span.textContent = match[0];
        frag.appendChild(span);
        last = match.index + match[0].length;
      }
      frag.appendChild(document.createTextNode(text.slice(last)));
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
    });
  }
  cloakEditorial(document.body);

  function safeSvg(text) {
    var clean = String(text || "").replace(/^\uFEFF/, "").replace(/<\?xml[\s\S]*?\?>/, "").trim();
    if (!clean || !/^<svg[\s>]/i.test(clean)) return "";
    if (/<script|on\w+\s*=|javascript:/i.test(clean)) return "";
    return clean;
  }
  function mediaUrl(src) {
    if (!src) return "";
    if (/^(https?:|data:|\.\.)/.test(src)) return src;
    return fromRoot(src);
  }
  function itemsFor(data) {
    var code = document.body.getAttribute("data-room") || document.body.getAttribute("data-track");
    if (!data || !code) return [];
    var bag = data.rooms || data;
    var list = bag[code] || [];
    if (!Array.isArray(list) && Array.isArray(data.items)) {
      list = data.items.filter(function (item) { return item && (item.room === code || item.roomId === code || item.code === code); });
    }
    if (!Array.isArray(list)) return [];
    return list.filter(function (item) {
      return item && /^(svg|flow|image|audio|video)$/.test(String(item.type || "").toLowerCase());
    });
  }
  function isSvgItem(item) {
    var src = String(item.src || item.href || item.file || "");
    if (item.markup || item.svg) return true;
    if (/\.svg(?:$|\?)/i.test(src)) return true;
    var type = String(item.type || "").toLowerCase();
    return type === "svg" || type === "flow";
  }
  function prefixSvgIds(svg, prefix) {
    var ids = [];
    var found = /\sid="([^"]+)"/g;
    var match;
    while ((match = found.exec(svg))) ids.push(match[1]);
    if (!ids.length) return svg;
    var known = {};
    ids.forEach(function (id) { known[id] = true; });
    ids.sort(function (a, b) { return b.length - a.length; });
    ids.forEach(function (id) {
      var escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      svg = svg.replace(new RegExp('id="' + escaped + '"', "g"), 'id="' + prefix + id + '"');
      svg = svg.replace(new RegExp("url\\(#" + escaped + "\\)", "g"), "url(#" + prefix + id + ")");
      svg = svg.replace(new RegExp('href="#' + escaped + '"', "g"), 'href="#' + prefix + id + '"');
      svg = svg.replace(new RegExp("href='#" + escaped + "'", "g"), "href='#" + prefix + id + "'");
    });
    svg = svg.replace(/aria-labelledby="([^"]+)"/g, function (_, list) {
      return 'aria-labelledby="' + list.split(/\s+/).map(function (id) {
        return known[id] ? prefix + id : id;
      }).join(" ") + '"';
    });
    return svg;
  }
  function captionFor(item) {
    var cap = document.createElement("figcaption");
    var title = item.title || item.alt || "";
    if (title) {
      var strong = document.createElement("strong");
      strong.textContent = title;
      cap.appendChild(strong);
    }
    if (item.caption) cap.appendChild(document.createTextNode(item.caption));
    if (!title && !item.caption) cap.textContent = String(item.type || "Media");
    return cap;
  }
  function frameFor(item) {
    var frame = document.createElement("div");
    frame.className = "media-frame";
    var type = String(item.type || "").toLowerCase();
    var src = mediaUrl(item.src || item.href || item.file);
    if (type === "audio" && !isSvgItem(item)) {
      var audio = document.createElement("audio");
      audio.controls = true;
      audio.preload = "none";
      if (src) audio.src = src;
      frame.appendChild(audio);
      return frame;
    }
    if (type === "video" && !isSvgItem(item)) {
      var video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.setAttribute("playsinline", "");
      if (src) video.src = src;
      frame.appendChild(video);
      return frame;
    }
    var img = document.createElement("img");
    img.alt = item.alt || item.title || item.caption || "Illustration";
    img.decoding = "async";
    if (src) img.src = src;
    frame.appendChild(img);
    return frame;
  }
  function paintSvg(frame, svg) {
    frame.innerHTML = svg;
  }
  function mediaHost(section) {
    if (section) {
      var byId = document.getElementById(section);
      if (byId) return byId;
      try {
        var byClass = document.querySelector("." + section);
        if (byClass) return byClass;
      } catch (err) { /* a section name is not always a selector */ }
    }
    return document.getElementById("main") || document.body;
  }
  function placeInline(host, node, item) {
    if (String(item.type || "").toLowerCase() === "image") {
      var heading = host.querySelector("h1");
      if (heading && heading.parentNode === host) {
        heading.insertAdjacentElement("afterend", node);
        return;
      }
    }
    host.appendChild(node);
  }
  function placeGallery(gallery) {
    var article = document.querySelector(".room-main") || document.querySelector("main");
    var h1 = article && article.querySelector("h1");
    if (!h1) {
      if (article) article.insertBefore(gallery, article.firstChild);
      return;
    }
    var section = h1.closest("section");
    if (section && section.parentNode) section.insertAdjacentElement("afterend", gallery);
    else h1.insertAdjacentElement("afterend", gallery);
  }
  function mountMedia(data) {
    var items = itemsFor(data);
    if (!items.length || document.getElementById("media")) return Promise.resolve(false);
    var gallery = document.createElement("section");
    gallery.id = "media";
    gallery.className = "media-gallery";
    gallery.setAttribute("aria-label", "Media");
    gallery.innerHTML = '<p class="sec-kicker">Media</p><h2>Media</h2><div class="media-grid"></div>';
    var grid = gallery.querySelector(".media-grid");
    var jobs = [];
    items.forEach(function (item, index) {
      var type = String(item.type || "").toLowerCase();
      var card = document.createElement("figure");
      card.className = "media-card" + (type === "flow" ? " media-flow" : "");
      card.setAttribute("data-media-type", type);
      card.appendChild(frameFor(item));
      card.appendChild(captionFor(item));
      grid.appendChild(card);
      var inline = document.createElement("figure");
      inline.className = "media-inline" + (type === "flow" ? " media-flow" : "");
      inline.setAttribute("data-media-type", type);
      inline.appendChild(frameFor(item));
      inline.appendChild(captionFor(item));
      placeInline(mediaHost(String(item.section || item.anchor || item.at || "").replace(/^#/, "")), inline, item);
      if (!isSvgItem(item)) return;
      var embedded = safeSvg(item.markup || item.svg || "");
      jobs.push({ card: card, inline: inline, embedded: embedded, src: mediaUrl(item.src || item.href || item.file), index: index });
    });
    placeGallery(gallery);
    if (!jobs.length) return Promise.resolve(true);
    return Promise.all(jobs.map(function (job) {
      if (job.embedded) return Promise.resolve(job);
      if (!job.src || location.protocol === "file:") return Promise.resolve(job);
      return fetch(job.src).then(function (res) {
        return res.ok ? res.text() : "";
      }).then(function (text) {
        job.embedded = safeSvg(text);
        return job;
      }).catch(function () { return job; });
    })).then(function (done) {
      done.forEach(function (job) {
        if (!job.embedded) return;
        paintSvg(job.inline.querySelector(".media-frame"), job.embedded);
        paintSvg(job.card.querySelector(".media-frame"), prefixSvgIds(job.embedded, "gal" + job.index + "-"));
      });
      return true;
    });
  }
  function loadMedia(done) {
    function fromScript() {
      if (window.CANON_MEDIA) { done(window.CANON_MEDIA); return; }
      var script = document.createElement("script");
      script.src = fromRoot("data/media.js");
      script.onload = function () { done(window.CANON_MEDIA || null); };
      script.onerror = function () { done(null); };
      document.head.appendChild(script);
    }
    if (location.protocol === "file:") { fromScript(); return; }
    var url = fromRoot("data/media.json");
    fetch(url).then(function (res) {
      if (!res.ok) throw new Error("missing");
      return res.json();
    }).then(done).catch(fromScript);
  }

  function armFlows(scope) {
    if (reduce) return;
    (scope || document).querySelectorAll("svg").forEach(function (svg) {
      if (svg.classList.contains("canon-svg") || svg.querySelector(".pkt, .packet")) return;
      var path = svg.querySelector("path.packet-lane") || svg.querySelector("path[d]");
      if (!path) return;
      var d = path.getAttribute("d") || "";
      if (d.length < 8) return;
      if (!path.id) path.id = "lane-" + Math.random().toString(16).slice(2);
      var ns = "http://www.w3.org/2000/svg";
      var dot = document.createElementNS(ns, "circle");
      dot.setAttribute("r", "5");
      dot.setAttribute("class", "packet");
      dot.setAttribute("fill", "#fde68a");
      var motion = document.createElementNS(ns, "animateMotion");
      motion.setAttribute("dur", "3.6s");
      motion.setAttribute("repeatCount", "indefinite");
      var mpath = document.createElementNS(ns, "mpath");
      mpath.setAttribute("href", "#" + path.id);
      motion.appendChild(mpath);
      dot.appendChild(motion);
      svg.appendChild(dot);
    });
  }

  function cleanLabel(text) {
    return String(text || "").replace(/\s+/g, " ").replace(/^\d+\s*/, "").trim();
  }
  function buildToc() {
    if (!tocRail) return;
    var links = [];
    var existing = document.querySelectorAll(".room-shell > .toc a");
    if (existing.length) {
      existing.forEach(function (a) {
        var href = a.getAttribute("href") || "";
        if (href.charAt(0) !== "#") return;
        links.push({ id: href.slice(1), label: cleanLabel(a.getAttribute("data-tip") || a.textContent) });
      });
    } else {
      var sections = document.querySelectorAll("#main section[id], main section[id]");
      sections.forEach(function (section) {
        if (section.closest(".v4-toc")) return;
        var heading = section.querySelector("h1, h2, h3");
        links.push({ id: section.id, label: cleanLabel(heading ? heading.textContent : section.id) });
      });
      if (!links.length) {
        document.querySelectorAll("#main h2, main h2").forEach(function (heading, index) {
          if (!heading.id) heading.id = "section-" + index;
          links.push({ id: heading.id, label: cleanLabel(heading.textContent) });
        });
      }
      if (!links.length) {
        var pageTitle = document.querySelector("#main h1, main h1");
        if (pageTitle) {
          if (!pageTitle.id) pageTitle.id = "page-title";
          links.push({ id: pageTitle.id, label: cleanLabel(pageTitle.textContent) });
        }
      }
    }
    if (document.getElementById("media") && !links.some(function (link) { return link.id === "media"; })) {
      links.unshift({ id: "media", label: "Media" });
    }
    var items = links.map(function (link) {
      var name = SECTION_ICON[link.id] || "spark";
      return '<li><a href="#' + esc(link.id) + '">' + icon(name) + "<span>" + esc(link.label || link.id) + "</span></a></li>";
    }).join("");
    tocRail.innerHTML = '<div class="v4-toc-head"><p>On this page</p><b data-read-pct>0%</b></div><div class="v4-toc-meter" aria-hidden="true"><i data-read-fill></i></div>' +
      (items ? "<ol>" + items + "</ol>" : "<p>This page is one section.</p>");
    var spy = {};
    tocRail.querySelectorAll("a").forEach(function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      if (id) spy[id] = a;
    });
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tocRail.querySelectorAll("a").forEach(function (a) { a.classList.remove("active"); });
          if (spy[entry.target.id]) spy[entry.target.id].classList.add("active");
        });
      }, { rootMargin: "-20% 0px -65% 0px", threshold: 0.01 });
      Object.keys(spy).forEach(function (id) {
        var node = document.getElementById(id);
        if (node) observer.observe(node);
      });
    }
  }

  function onRead() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.max(0, Math.min(100, (window.scrollY / max) * 100)) : 0;
    var bar = read.querySelector("i");
    if (bar) bar.style.width = pct + "%";
    var label = document.querySelector("[data-read-pct]");
    if (label) label.textContent = Math.round(pct) + "% read";
    var fill = document.querySelector("[data-read-fill]");
    if (fill) fill.style.width = pct + "%";
  }
  window.addEventListener("scroll", onRead, { passive: true });

  function placeToc() {
    if (!tocRail || !header || !stage) return;
    if (window.matchMedia("(max-width: 1100px)").matches) {
      if (tocRail.previousElementSibling !== header) header.insertAdjacentElement("afterend", tocRail);
    } else if (tocRail.parentElement !== stage) {
      stage.appendChild(tocRail);
    }
  }

  loadMedia(function (data) {
    Promise.resolve(mountMedia(data)).then(function () {
      buildToc();
      placeToc();
      onRead();
      armFlows(document);
    });
  });
  buildToc();
  placeToc();
  onRead();
  window.addEventListener("resize", placeToc);

  if (location.hash) {
    var hashed = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!hashed) {
      document.querySelectorAll("#quiz .qcard strong, .qcard > header strong, .qcard strong").forEach(function (strong) {
        var card = strong.closest(".qcard");
        if (card && !card.id) card.id = strong.textContent.trim();
      });
    }
  }
  document.querySelectorAll("#quiz .qcard").forEach(function (card) {
    var strong = card.querySelector("strong");
    if (strong && !card.id) card.id = strong.textContent.trim();
  });

  if (!reduce && fine && !touch) {
    root.classList.add("v4-cursor");
    var dot = document.createElement("div");
    dot.className = "v4-cursor";
    document.body.appendChild(dot);
    var trails = [];
    for (var t = 0; t < 6; t++) {
      var bit = document.createElement("div");
      bit.className = "v4-trail";
      document.body.appendChild(bit);
      trails.push({ el: bit, x: 0, y: 0 });
    }
    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    document.addEventListener("pointermove", function (event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      mx = event.clientX;
      my = event.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      var typingNow = event.target && event.target.closest && event.target.closest("input, textarea, select");
      dot.classList.toggle("is-off", !!typingNow);
      trails.forEach(function (trail) { trail.el.classList.toggle("is-off", !!typingNow); });
    }, { passive: true });
    function trailFrame() {
      var x = mx;
      var y = my;
      trails.forEach(function (trail) {
        trail.x += (x - trail.x) * 0.35;
        trail.y += (y - trail.y) * 0.35;
        trail.el.style.transform = "translate3d(" + trail.x + "px," + trail.y + "px,0)";
        x = trail.x;
        y = trail.y;
      });
      requestAnimationFrame(trailFrame);
    }
    requestAnimationFrame(trailFrame);
  }

  if (!reduce) {
    var mag = null;
    document.addEventListener("pointermove", function (event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      var next = event.target && event.target.closest ? event.target.closest(".btn, .ghost, .v4-jump, .v4-mag") : null;
      if (mag && mag !== next) { mag.style.transform = ""; mag = null; }
      if (!next) return;
      var rect = next.getBoundingClientRect();
      var x = event.clientX - (rect.left + rect.width / 2);
      var y = event.clientY - (rect.top + rect.height / 2);
      if (Math.hypot(x, y) > 90) { next.style.transform = ""; return; }
      next.style.transform = "translate(" + (x * 0.2).toFixed(1) + "px," + (y * 0.2).toFixed(1) + "px)";
      mag = next;
    }, { passive: true });
    document.querySelectorAll(".stat, .qcard, .media-card, .plan-card").forEach(function (card) {
      if (card.classList.contains("tilt")) return;
      card.addEventListener("pointermove", function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
    var hero = document.querySelector(".hero-live");
    if (hero) {
      window.addEventListener("scroll", function () {
        var y = window.scrollY || 0;
        hero.querySelectorAll("[data-depth]").forEach(function (layer) {
          var depth = Number(layer.getAttribute("data-depth")) || 0.2;
          layer.style.transform = "translateY(" + (y * depth * 0.12).toFixed(1) + "px)";
        });
      }, { passive: true });
    }
    if ("IntersectionObserver" in window) {
      var revealNodes = document.querySelectorAll("main section:not(.world-hero), .track-tile, .stat, .plan-item, .atlas-card, .chart-card, .career-grid article");
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          seen.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      revealNodes.forEach(function (node) {
        node.classList.add("v4-reveal");
        seen.observe(node);
      });
    }
  }

  document.querySelectorAll("[data-count]").forEach(function (el) {
    if (!reduce && el.textContent === "0") return;
    if (reduce) el.textContent = el.getAttribute("data-count") || el.textContent;
  });

  var uniCss = document.createElement("link");
  uniCss.rel = "stylesheet";
  uniCss.href = rootPrefix + "assets/css/university.css";
  document.head.appendChild(uniCss);
  var uniJs = document.createElement("script");
  uniJs.src = rootPrefix + "assets/js/university.js";
  uniJs.async = false;
  uniJs.defer = true;
  document.body.appendChild(uniJs);
})();
