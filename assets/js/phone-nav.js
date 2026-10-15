/* Phone menu, quick bar, and the one Settings panel. Relative paths. */
(function () {
  var root = document.documentElement;

  function prefix() {
    var nodes = document.querySelectorAll("script[src]");
    var mark = "assets/js/phone-nav.js";
    for (var i = 0; i < nodes.length; i++) {
      var src = nodes[i].getAttribute("src") || "";
      var at = src.indexOf(mark);
      if (at !== -1) return src.slice(0, at);
    }
    return "";
  }
  var rootPrefix = prefix();
  function href(path) {
    return rootPrefix + path;
  }
  function motionReduced() {
    if (root.dataset.motion === "reduce") return true;
    if (root.dataset.motion === "full") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function applyMotion(mode) {
    if (mode === "reduce" || mode === "full") {
      root.dataset.motion = mode;
      try { localStorage.setItem("canon-motion", mode); } catch (err) { /* storage off */ }
    } else {
      delete root.dataset.motion;
      try { localStorage.removeItem("canon-motion"); } catch (err) { /* storage off */ }
    }
    root.classList.toggle("v4-motion", !motionReduced());
    document.dispatchEvent(new CustomEvent("canon-motion", { detail: { reduced: motionReduced() } }));
  }

  var view = document.querySelector('meta[name="viewport"]');
  if (view && view.content.indexOf("viewport-fit") === -1) {
    view.setAttribute("content", view.content + ", viewport-fit=cover");
  }

  var SECTIONS = [
    ["learn", "Learn", "index.html"],
    ["start", "Start here", "start.html"],
    ["rooms", "Rooms", "index.html#rooms"],
    ["diagrams", "Diagrams", "diagrams.html"],
    ["flows", "Flows", "flows.html"],
    ["charts", "Charts", "charts.html"],
    ["cheat", "Cheat Codes", "downloads.html"],
    ["play", "Play", "play.html"],
    ["ecosystem", "Ecosystem", "ecosystem.html"],
    ["downloads", "Downloads", "downloads.html"],
    ["careers", "Careers", "careers.html"],
    ["quizzes", "Quizzes", "quizzes.html"],
    ["cards", "Flashcards", "flashcards.html"],
    ["glossary", "Glossary", "glossary.html"],
    ["labs", "Labs", "labs.html"],
    ["cases", "Cases", "drills.html"],
    ["interviews", "Interviews", "interviews.html"],
    ["regions", "Countries and residency", "regions.html"],
    ["mastery", "Mastery", "mastery.html"]
  ];

  var bar = document.querySelector(".topbar .bar-inner");
  var opener = null;
  if (bar && !bar.querySelector(".phone-menu-btn")) {
    opener = document.createElement("button");
    opener.type = "button";
    opener.className = "phone-menu-btn";
    opener.setAttribute("aria-expanded", "false");
    opener.setAttribute("aria-controls", "phone-menu");
    opener.innerHTML = '<span class="phone-burger" aria-hidden="true"></span><span data-i18n="menu">Menu</span>';
    bar.appendChild(opener);
  }

  var menu = document.createElement("div");
  menu.id = "phone-menu";
  menu.className = "phone-menu";
  menu.hidden = true;
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-labelledby", "phone-menu-title");
  var sectionLinks = SECTIONS.map(function (item) {
    return '<a href="' + href(item[2]) + '" data-i18n="' + item[0] + '">' + item[1] + "</a>";
  }).join("");
  menu.innerHTML =
    '<div class="phone-menu-bar">' +
    '<p id="phone-menu-title" data-i18n="menu">Menu</p>' +
    '<button type="button" class="phone-menu-close" data-i18n="close">Close</button>' +
    "</div>" +
    '<nav class="phone-menu-list" aria-label="University">' + sectionLinks +
    '<button type="button" data-open-settings data-i18n="settings">Settings</button>' +
    '<button type="button" data-open-rooms data-i18n="browse">Browse rooms</button>' +
    "</nav>" +
    '<nav class="phone-menu-extra" aria-label="CypherMonkey">' +
    '<a href="https://cyphermonkeylabs.com">Labs home</a>' +
    '<a href="https://linktr.ee/cyphermonkey">Linktree</a>' +
    '<a href="https://github.com/CypherMonkeyLabs/webex-lab-free-university-mesmerizing">Rate, comment, help</a>' +
    '<a href="https://dev.to/cyphermonkey">dev.to</a>' +
    '<a href="https://huggingface.co/Cypher0x9">Hugging Face</a>' +
    '<a href="https://x.com/Cypher0x9">X</a>' +
    "</nav>";
  document.body.appendChild(menu);

  document.querySelectorAll(".uni-menu").forEach(function (nav) {
    if (nav.querySelector("[data-open-settings]")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "uni-settings";
    button.setAttribute("data-open-settings", "");
    button.setAttribute("data-i18n", "settings");
    button.textContent = "Settings";
    nav.appendChild(button);
  });

  var dock = document.createElement("nav");
  dock.className = "phone-dock";
  dock.setAttribute("aria-label", "Quick");
  dock.innerHTML =
    '<a href="' + href("index.html") + '" data-i18n="learn">Learn</a>' +
    '<a href="' + href("diagrams.html") + '" data-i18n="diagrams">Diagrams</a>' +
    '<a href="' + href("play.html") + '" data-i18n="play">Play</a>' +
    '<button type="button" data-open-menu data-i18n="menu">Menu</button>' +
    '<button type="button" data-listen data-i18n="listen">Listen</button>';
  document.body.appendChild(dock);

  var settings = document.createElement("div");
  settings.className = "settings-panel";
  settings.hidden = true;
  settings.setAttribute("role", "dialog");
  settings.setAttribute("aria-modal", "true");
  settings.setAttribute("aria-labelledby", "settings-title");
  settings.innerHTML =
    '<div class="settings-card">' +
    '<div class="settings-bar"><h2 id="settings-title" data-i18n="settings">Settings</h2>' +
    '<button type="button" class="settings-close" data-i18n="close">Close</button></div>' +
    '<fieldset class="settings-themes"><legend data-i18n="themeWord">Theme</legend>' +
    '<button type="button" data-set-theme="aurora">Aurora</button>' +
    '<button type="button" data-set-theme="neon">Neon</button>' +
    '<button type="button" data-set-theme="holographic">Holographic</button>' +
    '<button type="button" data-set-theme="cyberpunk">Cyberpunk</button>' +
    '<button type="button" data-set-theme="sunset">Sunset</button>' +
    '<button type="button" data-set-theme="paper">Light</button>' +
    "</fieldset>" +
    '<label class="settings-lang"><span data-i18n="langName">Language</span> <select data-lang aria-label="Language"></select></label>' +
    '<fieldset data-settings-sound><legend data-i18n="sound">Sound</legend>' +
    '<button type="button" data-listen data-i18n="listen">Listen</button>' +
    '<button type="button" data-mute data-i18n="mute">Mute</button>' +
    '<button type="button" data-rate="0.85">0.85×</button>' +
    '<button type="button" data-rate="1">1×</button>' +
    '<button type="button" data-rate="1.15">1.15×</button>' +
    "</fieldset>" +
    '<label class="settings-motion"><input type="checkbox" data-reduce-motion> <span data-i18n="reduceMotion">Reduce motion</span></label>' +
    "</div>";
  document.body.appendChild(settings);

  var pushed = false;
  var lastFocus = null;

  function focusables(rootNode) {
    return Array.prototype.slice.call(rootNode.querySelectorAll("a[href], button, input, select, textarea")).filter(function (el) {
      return !el.disabled && !el.closest("[hidden]");
    });
  }
  function fileName() {
    var path = location.pathname.split("/").pop() || "index.html";
    return path || "index.html";
  }
  function markCurrent() {
    var file = fileName();
    var hash = location.hash;
    document.querySelectorAll(".phone-menu a, .phone-dock a, .uni-menu a").forEach(function (link) {
      var url;
      try { url = new URL(link.getAttribute("href"), location.href); } catch (err) { return; }
      if (url.origin !== location.origin) {
        link.classList.remove("is-current");
        link.removeAttribute("aria-current");
        return;
      }
      var target = url.pathname.split("/").pop() || "index.html";
      var on = target === file;
      if (on && target === "index.html") {
        if (url.hash === "#rooms") on = hash === "#rooms";
        else on = hash !== "#rooms";
      } else if (on && url.hash) {
        on = url.hash === hash;
      }
      link.classList.toggle("is-current", on);
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }
  function openMenu(from) {
    if (!menu.hidden) return;
    lastFocus = from || document.activeElement;
    menu.hidden = false;
    document.body.classList.add("phone-menu-open");
    if (opener) opener.setAttribute("aria-expanded", "true");
    var closeBtn = menu.querySelector(".phone-menu-close");
    if (closeBtn) closeBtn.focus();
    if (!pushed) {
      history.pushState({ phoneMenu: 1 }, "");
      pushed = true;
    }
  }
  function closeMenu(fromPop) {
    if (menu.hidden) return;
    menu.hidden = true;
    document.body.classList.remove("phone-menu-open");
    if (opener) opener.setAttribute("aria-expanded", "false");
    if (!fromPop && pushed) {
      pushed = false;
      history.back();
    } else {
      pushed = false;
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function openSettings(from) {
    lastFocus = from || document.activeElement;
    settings.hidden = false;
    document.body.classList.add("settings-open");
    var closeBtn = settings.querySelector(".settings-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeSettings() {
    if (settings.hidden) return;
    settings.hidden = true;
    document.body.classList.remove("settings-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function trap(event, panel, closer) {
    if (event.key === "Escape") {
      event.preventDefault();
      closer();
      return;
    }
    if (event.key !== "Tab") return;
    var items = focusables(panel);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (opener) opener.addEventListener("click", function () { openMenu(opener); });
  dock.querySelector("[data-open-menu]").addEventListener("click", function (event) { openMenu(event.currentTarget); });
  menu.querySelector(".phone-menu-close").addEventListener("click", function () { closeMenu(false); });
  menu.addEventListener("keydown", function (event) {
    if (!settings.hidden) return;
    trap(event, menu, function () { closeMenu(false); });
  });
  settings.addEventListener("keydown", function (event) { trap(event, settings, closeSettings); });
  settings.querySelector(".settings-close").addEventListener("click", closeSettings);
  settings.addEventListener("click", function (event) { if (event.target === settings) closeSettings(); });
  document.querySelectorAll("[data-open-settings]").forEach(function (btn) {
    btn.addEventListener("click", function () { openSettings(btn); });
  });
  menu.querySelector("[data-open-rooms]").addEventListener("click", function () {
    closeMenu(false);
    root.dataset.drawer = "open";
    document.body.classList.add("drawer-open");
  });
  window.addEventListener("popstate", function () {
    if (!menu.hidden) closeMenu(true);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!settings.hidden) closeSettings();
    else if (!menu.hidden) closeMenu(false);
  });

  function audioEl() {
    return document.querySelector("[data-audio]");
  }
  function ensureAudio() {
    var audio = audioEl();
    if (audio) return audio;
    audio = document.createElement("audio");
    audio.setAttribute("data-audio", "");
    audio.preload = "none";
    audio.setAttribute("controls", "");
    settings.querySelector("[data-settings-sound]").appendChild(audio);
    return audio;
  }
  function arm(audio) {
    if (!audio.getAttribute("src")) audio.src = rootPrefix + "audio/how-to-use.mp3";
    audio.preload = "none";
  }
  function listen(button) {
    var audio = ensureAudio();
    arm(audio);
    var next = audio.paused;
    var done = next ? audio.play() : Promise.resolve(audio.pause());
    Promise.resolve(done).catch(function () { /* file arrives later */ });
    document.querySelectorAll("[data-listen]").forEach(function (el) {
      el.setAttribute("aria-pressed", next ? "true" : "false");
    });
    if (button) button.setAttribute("aria-pressed", next ? "true" : "false");
  }
  document.querySelectorAll("[data-listen]").forEach(function (btn) {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () { listen(btn); });
  });
  settings.querySelector("[data-mute]").addEventListener("click", function (event) {
    var audio = ensureAudio();
    audio.muted = !audio.muted;
    event.currentTarget.setAttribute("aria-pressed", audio.muted ? "true" : "false");
  });
  settings.querySelectorAll("[data-rate]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var audio = ensureAudio();
      arm(audio);
      audio.playbackRate = Number(btn.getAttribute("data-rate")) || 1;
    });
  });

  var motionBox = settings.querySelector("[data-reduce-motion]");
  motionBox.checked = motionReduced();
  motionBox.addEventListener("change", function () {
    applyMotion(motionBox.checked ? "reduce" : "full");
  });

  settings.querySelectorAll("[data-set-theme]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var theme = btn.getAttribute("data-set-theme");
      root.dataset.theme = theme;
      try { localStorage.setItem("canon-theme", theme); } catch (err) { /* storage off */ }
      document.querySelectorAll("[data-set-theme]").forEach(function (peer) {
        peer.setAttribute("aria-checked", peer.getAttribute("data-set-theme") === theme ? "true" : "false");
      });
      document.dispatchEvent(new CustomEvent("canon-theme", { detail: { theme: theme } }));
    });
  });

  markCurrent();
  window.addEventListener("hashchange", markCurrent);
})();
