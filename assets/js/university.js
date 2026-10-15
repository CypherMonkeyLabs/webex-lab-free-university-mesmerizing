/* University chrome for every Canon page. Relative paths. No network required to read. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function prefix() {
    var nodes = document.querySelectorAll("script[src]");
    var mark = "assets/js/university.js";
    for (var i = 0; i < nodes.length; i++) {
      var src = nodes[i].getAttribute("src") || "";
      var at = src.indexOf(mark);
      if (at !== -1) return src.slice(0, at);
    }
    return "";
  }
  var rootPrefix = prefix();
  function fromRoot(href) {
    if (!href) return "";
    if (/^(https?:|mailto:|#)/.test(href)) return href;
    return rootPrefix + String(href).replace(/^\//, "");
  }

  var LABS = [
    ["UC Lab", "https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/"],
    ["AI Lab", "https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/"],
    ["SIP Universe", "https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/"],
    ["Microsoft Voice", "https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/"],
    ["Amazon Connect", "https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/"],
    ["Genesys Cloud", "https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/"],
    ["Five9", "https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/"],
    ["NICE CXone", "https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/"]
  ];
  var CONTACT = "https://cyphermonkeylabs.com/#contact";
  var REPO = "https://github.com/CypherMonkeyLabs/webex-lab-free-university-mesmerizing";

  var stage = document.querySelector(".v4-stage");
  if (stage && !document.querySelector(".lab-links")) {
    var bar = document.createElement("nav");
    bar.className = "lab-links";
    bar.setAttribute("aria-label", "CypherMonkey");
    bar.innerHTML =
      '<a href="https://cyphermonkeylabs.com">Labs home</a>' +
      '<a href="https://linktr.ee/cyphermonkey">Linktree</a>' +
      '<a href="' + REPO + '">Rate, comment, help</a>' +
      '<a href="https://dev.to/cyphermonkey">dev.to</a>' +
      '<a href="https://huggingface.co/Cypher0x9">Hugging Face</a>' +
      '<a href="https://x.com/Cypher0x9">X</a>' +
      '<button type="button" data-offline-save>Save for offline</button>' +
      '<a href="' + fromRoot("downloads/webex-university-offline.zip") + '">Offline bundle</a>';
    stage.insertBefore(bar, stage.firstChild);
  }

  function footerHtml() {
    var labs = LABS.map(function (lab) {
      return '<a href="' + lab[1] + '">' + lab[0] + "<small>Next lab</small></a>";
    }).join("");
    return (
      '<p class="lab-sign">CypherMonkey · Webex Lab Free University</p>' +
      '<p>Independent educational project. Not affiliated with or endorsed by Cisco or any other vendor. Trademarks belong to their owners. MIT code. CC BY-NC-SA content.</p>' +
      '<p class="lab-actions">' +
      '<a href="' + REPO + '">Rate, comment, help</a>' +
      '<a href="' + CONTACT + '">Report a concern / takedown</a>' +
      '<a href="' + CONTACT + '">Work with us</a>' +
      '<a href="' + fromRoot("downloads.html") + '">Cheat Codes</a>' +
      '<a href="' + fromRoot("play.html") + '">Play Lab</a>' +
      "</p>" +
      '<nav class="next-labs" aria-label="Other labs">' + labs + "</nav>"
    );
  }
  var foot = document.querySelector(".site-footer");
  if (foot) {
    foot.classList.add("lab-footer");
    foot.innerHTML = footerHtml();
  } else {
    var main = document.querySelector("main") || document.body;
    var extra = document.createElement("footer");
    extra.className = "site-footer lab-footer wrap";
    extra.innerHTML = footerHtml();
    main.appendChild(extra);
  }

  var FACES = [
    { name: "wave", line: "Start in Control Hub, then a dial plan.", mouth: "M28 58 Q40 68 52 58" },
    { name: "think", line: "5062 is the certificate trunk. 8934 is registration.", mouth: "M30 62 H50" },
    { name: "grin", line: "933 tests emergency. It does not call public safety.", mouth: "M26 56 Q40 72 54 56" },
    { name: "focus", line: "Recording turns Calling end-to-end encryption off.", mouth: "M32 60 Q40 56 48 60" }
  ];
  function faceSvg(face) {
    return (
      '<svg viewBox="0 0 80 96" aria-hidden="true">' +
      '<ellipse cx="40" cy="86" rx="18" ry="6" fill="#0b1020" opacity=".35"/>' +
      '<path d="M22 70c-8 2-12 10-8 14 6 2 16-2 18-8" fill="#a16207"/>' +
      '<path d="M58 70c8 2 12 10 8 14-6 2-16-2-18-8" fill="#a16207"/>' +
      '<circle cx="40" cy="42" r="26" fill="#fbbf24"/>' +
      '<circle cx="18" cy="46" r="8" fill="#f59e0b"/>' +
      '<circle cx="62" cy="46" r="8" fill="#f59e0b"/>' +
      '<circle cx="30" cy="40" r="4" fill="#1c1917"/>' +
      '<circle cx="50" cy="40" r="4" fill="#1c1917"/>' +
      '<circle cx="31" cy="39" r="1.2" fill="#fff"/>' +
      '<path d="' + face.mouth + '" fill="none" stroke="#1c1917" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M24 28c4-10 28-10 32 0" fill="none" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>' +
      "</svg>"
    );
  }
  var faceAt = new Date().getHours() % FACES.length;
  var monkey = document.createElement("button");
  monkey.type = "button";
  monkey.className = "monkey" + (reduce ? "" : " is-live");
  monkey.setAttribute("aria-label", "CypherMonkey. " + FACES[faceAt].line);
  monkey.innerHTML = faceSvg(FACES[faceAt]);
  var note = document.createElement("div");
  note.className = "monkey-note";
  note.hidden = true;
  note.textContent = FACES[faceAt].line;
  document.body.appendChild(monkey);
  document.body.appendChild(note);
  monkey.addEventListener("click", function () {
    note.hidden = !note.hidden;
    note.textContent = FACES[faceAt].line;
  });
  if (!reduce) {
    window.setInterval(function () {
      faceAt = (faceAt + 1) % FACES.length;
      monkey.innerHTML = faceSvg(FACES[faceAt]);
      monkey.setAttribute("aria-label", "CypherMonkey. " + FACES[faceAt].line);
      if (!note.hidden) note.textContent = FACES[faceAt].line;
    }, 8000);
  }

  function badges() {
    try { return JSON.parse(localStorage.getItem("canon-badges") || "{}"); }
    catch (err) { return {}; }
  }
  function award(id) {
    var bag = badges();
    if (bag[id]) return false;
    bag[id] = new Date().toISOString();
    try { localStorage.setItem("canon-badges", JSON.stringify(bag)); } catch (err) { /* storage off */ }
    document.dispatchEvent(new CustomEvent("canon-badge", { detail: id }));
    return true;
  }
  window.CANON_UNIVERSITY = { fromRoot: fromRoot, award: award, badges: badges, contact: CONTACT, repo: REPO };

  try {
    var progress = JSON.parse(localStorage.getItem("canon-progress") || "{}");
    var opened = progress && progress.rooms ? Object.keys(progress.rooms).length : 0;
    if (opened >= 1) award("first-room");
    if (opened >= 10) award("ten-rooms");
    if (opened >= 63) award("all-rooms");
  } catch (err) { /* ignore */ }

  var konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  var konamiAt = 0;
  document.addEventListener("keydown", function (event) {
    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === konami[konamiAt]) {
      konamiAt += 1;
      if (konamiAt === konami.length) {
        konamiAt = 0;
        award("konami");
        var layer = document.createElement("div");
        layer.className = "egg-layer";
        layer.innerHTML = '<div class="egg-card" role="dialog" aria-label="Banana trunk"><p>Banana trunk unlocked.</p><p>CypherMonkey saved a badge in this browser. The trunk is still not a Cisco feature.</p><button type="button" class="ghost">Close</button></div>';
        document.body.appendChild(layer);
        layer.querySelector("button").addEventListener("click", function () { layer.remove(); });
        layer.addEventListener("click", function (ev) { if (ev.target === layer) layer.remove(); });
      }
    } else {
      konamiAt = key === konami[0] ? 1 : 0;
    }
  });

  function cacheUrls(urls) {
    if (!("caches" in window)) return Promise.reject(new Error("Cache Storage is unavailable"));
    return caches.open("webex-university-v8").then(function (cache) {
      return Promise.all(urls.map(function (url) {
        return fetch(url).then(function (response) {
          if (response && response.ok) return cache.put(url, response);
          return null;
        }).catch(function () { return null; });
      }));
    });
  }
  document.querySelectorAll("[data-offline-save]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = "Saving…";
      var manifest = fromRoot("downloads/cache-manifest.json");
      fetch(manifest).then(function (response) { return response.json(); }).then(function (list) {
        var urls = (list || []).map(function (item) { return fromRoot(item); });
        return cacheUrls(urls);
      }).then(function () {
        award("offline");
        btn.textContent = "Saved in this browser";
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = label;
      });
    });
  });

  var MENU = [
    ["Diagrams", "diagrams.html"],
    ["Flows", "flows.html"],
    ["Charts", "charts.html"],
    ["Cheat Codes", "downloads.html"],
    ["Play", "play.html"],
    ["Ecosystem", "ecosystem.html"],
    ["Downloads", "downloads.html"],
    ["Careers", "careers.html"]
  ];
  if (!document.querySelector(".uni-menu")) {
    var menu = document.createElement("nav");
    menu.className = "uni-menu";
    menu.setAttribute("aria-label", "University");
    menu.innerHTML = MENU.map(function (item) {
      return '<a href="' + fromRoot(item[1]) + '">' + item[0] + "</a>";
    }).join("");
    var header = document.querySelector(".topbar .bar-inner") || document.querySelector(".topbar");
    if (header) header.appendChild(menu);
  }
  document.querySelectorAll(".uni-menu").forEach(function (menu) {
    var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
    links.forEach(function (link, index) {
      link.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = links[(index + 1) % links.length];
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = links[(index - 1 + links.length) % links.length];
        if (event.key === "Home") next = links[0];
        if (event.key === "End") next = links[links.length - 1];
        if (!next) return;
        event.preventDefault();
        next.focus();
      });
    });
  });
  document.querySelectorAll("[data-set-theme]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var theme = btn.getAttribute("data-set-theme");
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem("canon-theme", theme); } catch (err) { /* storage off */ }
      document.querySelectorAll("[data-set-theme]").forEach(function (peer) {
        peer.setAttribute("aria-checked", peer.getAttribute("data-set-theme") === theme ? "true" : "false");
      });
      document.dispatchEvent(new CustomEvent("canon-theme", { detail: { theme: theme } }));
    });
  });
  var spark = document.querySelector(".track-spark, .uni-fold");
  if (spark && !reduce) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      spark.querySelectorAll("[data-depth]").forEach(function (layer) {
        var depth = Number(layer.getAttribute("data-depth")) || 0.3;
        layer.style.transform = "translateY(" + (y * depth * 0.08).toFixed(1) + "px)";
      });
    }, { passive: true });
  }
  var confettiScript = document.createElement("script");
  confettiScript.src = fromRoot("vendor/confetti.browser.js");
  confettiScript.async = true;
  document.body.appendChild(confettiScript);
  document.addEventListener("canon-badge", function () {
    if (reduce || typeof window.confetti !== "function") return;
    window.confetti({ particleCount: 70, spread: 64, origin: { y: 0.75 } });
  });

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    navigator.serviceWorker.register(fromRoot("sw.js")).catch(function () { /* pages still work */ });
  }

  if (!document.body.classList.contains("home-world")) {
    document.body.classList.add("canon-world");
    var mainEl = document.querySelector("main");
    if (mainEl && !document.querySelector(".stage-banner")) {
      var banner = document.createElement("div");
      banner.className = "stage-banner";
      banner.setAttribute("aria-hidden", "true");
      banner.innerHTML = '<div class="stage-grid"></div><div class="stage-orb"></div><p class="stage-kicker">Canon · in color</p>';
      mainEl.parentNode.insertBefore(banner, mainEl);
    }
  }

  var wowCss = document.createElement("link");
  wowCss.rel = "stylesheet";
  wowCss.href = rootPrefix + "assets/css/wow.css";
  document.head.appendChild(wowCss);
  var i18nJs = document.createElement("script");
  i18nJs.src = rootPrefix + "assets/js/room-i18n.js";
  i18nJs.async = false;
  document.body.appendChild(i18nJs);
  var iconJs = document.createElement("script");
  iconJs.type = "module";
  iconJs.src = rootPrefix + "assets/js/track-icons.js";
  document.body.appendChild(iconJs);
  if (!document.body.classList.contains("home-world")) {
    var backdropJs = document.createElement("script");
    backdropJs.type = "module";
    backdropJs.src = rootPrefix + "assets/js/page-backdrop.js";
    document.body.appendChild(backdropJs);
  }
  var phoneJs = document.createElement("script");
  phoneJs.src = rootPrefix + "assets/js/phone-nav.js";
  phoneJs.async = false;
  document.body.appendChild(phoneJs);
  var wowJs = document.createElement("script");
  wowJs.src = rootPrefix + "assets/js/wow.js";
  wowJs.async = false;
  document.body.appendChild(wowJs);

  document.dispatchEvent(new CustomEvent("university-ready"));
})();
