/* Round 4 interactions: lightbox, chart tips, languages, mascot, audio, icons.
   Loaded after the university chrome. Relative paths. No CDN. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  var COPY = {
    en: { greeting: "Learn the Canon in orbit.", lede: "Sixty-three rooms. Watch the call path, then open a track.", kicker: "Webex study · 8 tracks · offline", diagrams: "Diagrams", flows: "Flows", charts: "Charts", cheat: "Cheat Codes", play: "Play", ecosystem: "Ecosystem", downloads: "Downloads", careers: "Careers", regions: "Countries and residency", audioTitle: "Architect desk", langName: "Language" },
    es: { greeting: "Aprende el Canon en órbita.", lede: "Sesenta y tres salas. Mira la ruta de la llamada y abre una pista.", kicker: "Estudio Webex · 8 pistas · sin red", diagrams: "Diagramas", flows: "Flujos", charts: "Gráficos", cheat: "Chuletas", play: "Jugar", ecosystem: "Ecosistema", downloads: "Descargas", careers: "Carreras", regions: "Países y residencia", audioTitle: "Mesa de arquitectos", langName: "Idioma" },
    hi: { greeting: "कैनन को रंगों में सीखें।", lede: "तिरसठ कमरे। कॉल पथ देखें, फिर एक ट्रैक खोलें।", kicker: "वेबेक्स अध्ययन · 8 ट्रैक · ऑफ़लाइन", diagrams: "आरेख", flows: "प्रवाह", charts: "चार्ट", cheat: "चीट कोड", play: "खेल", ecosystem: "पारिस्थितिकी", downloads: "डाउनलोड", careers: "करियर", regions: "देश और डेटा निवास", audioTitle: "आर्किटेक्ट डेस्क", langName: "भाषा" },
    te: { greeting: "క్యానన్‌ను కక్ష్యలో నేర్చుకోండి.", lede: "అరవై మూడు గదులు. కాల్ మార్గం చూడండి, తర్వాత ట్రాక్ తెరవండి.", kicker: "వెబెక్స్ అధ్యయనం · 8 ట్రాక్‌లు · ఆఫ్‌లైన్", diagrams: "రేఖాచిత్రాలు", flows: "ప్రవాహాలు", charts: "చార్టులు", cheat: "చీట్ కోడ్స్", play: "ఆట", ecosystem: "పర్యావరణం", downloads: "డౌన్‌లోడ్‌లు", careers: "కెరీర్", regions: "దేశాలు మరియు డేటా నివాసం", audioTitle: "ఆర్కిటెక్ట్ డెస్క్", langName: "భాష" },
    fr: { greeting: "Apprenez le Canon en orbite.", lede: "Soixante-trois salles. Suivez le chemin d'appel, puis ouvrez une piste.", kicker: "Étude Webex · 8 pistes · hors ligne", diagrams: "Schémas", flows: "Flux", charts: "Graphiques", cheat: "Antisèches", play: "Jouer", ecosystem: "Écosystème", downloads: "Téléchargements", careers: "Carrières", regions: "Pays et résidence", audioTitle: "Bureau des architectes", langName: "Langue" },
    de: { greeting: "Lerne den Canon in der Umlaufbahn.", lede: "Dreiundsechzig Räume. Folge dem Anrufpfad und öffne dann einen Track.", kicker: "Webex-Studium · 8 Tracks · offline", diagrams: "Diagramme", flows: "Flüsse", charts: "Charts", cheat: "Spickzettel", play: "Spielen", ecosystem: "Ökosystem", downloads: "Downloads", careers: "Karriere", regions: "Länder und Residenz", audioTitle: "Architektentisch", langName: "Sprache" },
    ja: { greeting: "軌道でキヤノンを学ぶ。", lede: "63の部屋。通話経路を見てからトラックを開く。", kicker: "Webex学習 · 8トラック · オフライン", diagrams: "図", flows: "フロー", charts: "チャート", cheat: "チートコード", play: "プレイ", ecosystem: "エコシステム", downloads: "ダウンロード", careers: "キャリア", regions: "国とデータ居住地", audioTitle: "設計者の机", langName: "言語" },
    ar: { greeting: "تعلّم القانون في المدار.", lede: "ثلاث وستون غرفة. شاهد مسار المكالمة ثم افتح مساراً.", kicker: "دراسة ويبيكس · ٨ مسارات · دون اتصال", diagrams: "مخططات", flows: "تدفقات", charts: "رسوم", cheat: "أوراق الغش", play: "لعب", ecosystem: "المنظومة", downloads: "تنزيلات", careers: "مهن", regions: "البلدان وإقامة البيانات", audioTitle: "مكتب المهندسين", langName: "اللغة" }
  };
  var LANGS = ["en", "es", "hi", "te", "fr", "de", "ja", "ar"];

  function applyLang(code) {
    if (LANGS.indexOf(code) === -1) code = "en";
    var pack = COPY[code];
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      if (pack[key]) node.textContent = pack[key];
    });
    root.lang = code === "en" ? "en" : code;
    root.dir = code === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("canon-lang", code); } catch (err) { /* storage off */ }
    document.querySelectorAll("[data-lang]").forEach(function (sel) { sel.value = code; });
  }

  function mountLang() {
    if (!document.querySelector("[data-lang]")) {
      var menu = document.querySelector(".uni-menu");
      if (menu) {
        var label = document.createElement("label");
        label.className = "lang-switch";
        label.innerHTML = '<span data-i18n="langName">Language</span> <select data-lang aria-label="Language"></select>';
        menu.insertAdjacentElement("afterend", label);
      }
    }
    document.querySelectorAll("[data-lang]").forEach(function (sel) {
      if (!sel.options.length) {
        LANGS.forEach(function (code) {
          var opt = document.createElement("option");
          opt.value = code;
          opt.textContent = code === "en" ? "English" : code === "es" ? "Español" : code === "hi" ? "हिन्दी" : code === "te" ? "తెలుగు" : code === "fr" ? "Français" : code === "de" ? "Deutsch" : code === "ja" ? "日本語" : "العربية";
          sel.appendChild(opt);
        });
      }
      sel.addEventListener("change", function () { applyLang(sel.value); });
    });
    var stored = "en";
    try { stored = localStorage.getItem("canon-lang") || "en"; } catch (err) { stored = "en"; }
    applyLang(stored);
  }

  var isoN = 0;
  function iso(color, kind) {
    isoN += 1;
    var id = "iso" + isoN;
    var top = kind % 3 === 0 ? "40,8 70,24 40,40 10,24" : kind % 3 === 1 ? "40,4 66,22 40,36 14,20" : "40,10 74,26 40,42 6,26";
    return '<svg class="iso-mark" viewBox="0 0 80 72" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="' + color + '"/></linearGradient></defs><polygon points="40,44 70,30 70,52 40,66" fill="#0b1020" opacity=".45"/><polygon points="10,30 40,44 40,66 10,52" fill="' + color + '" opacity=".55"/><polygon points="' + top + '" fill="url(#' + id + ')" stroke="#ffffff" stroke-opacity=".65"/><polygon points="28,20 46,28 34,34 16,26" fill="#ffffff" opacity=".55"/></svg>';
  }

  function paintIcons() {
    document.querySelectorAll(".tile-art").forEach(function (slot, index) {
      var tile = slot.closest(".track-tile");
      var color = "#22d3ee";
      if (tile) {
        var style = tile.getAttribute("style") || "";
        var match = style.match(/--card:\s*([^;]+)/);
        if (match) color = match[1].trim();
      }
      slot.innerHTML = iso(color, index);
    });
    document.querySelectorAll(".track-card").forEach(function (card, index) {
      var header = card.querySelector("header > div");
      if (!header || header.querySelector(".iso-mark")) return;
      var style = card.getAttribute("style") || "";
      var match = style.match(/--card:\s*([^;]+)/);
      var color = match ? match[1].trim() : "#22d3ee";
      header.insertAdjacentHTML("afterbegin", iso(color, index + 3));
    });
    document.querySelectorAll(".room-row").forEach(function (row, index) {
      var code = row.querySelector(".room-code");
      if (!code || code.querySelector(".iso-mark")) return;
      var card = row.closest(".track-card");
      var style = card ? card.getAttribute("style") || "" : "";
      var match = style.match(/--card:\s*([^;]+)/);
      code.insertAdjacentHTML("afterbegin", iso(match ? match[1].trim() : "#a5b4fc", index));
    });
  }

  var WHY = {
    "calling-registration": "Study map: phones register to Webex Calling. The Canon says they do not register through the Local Gateway. Re-check the calling room before you draw a trunk.",
    "certificate-trunk": "Study map for a certificate-based trunk. The live ports article names TCP 5062 as the certificate-trunk destination. Re-check help.webex.com/article/b2exve before you open a firewall.",
    "e911-held": "Study map for emergency calling. 933 is a test path and does not alert public safety. Re-check the RedSky room before you change a location.",
    "firewall-lanes": "Study map of lanes an architect checks. Port numbers in the rooms follow the cited Webex article. This drawing is not a firewall policy."
  };

  function svgRoot(object) {
    try {
      return object.contentDocument && object.contentDocument.documentElement;
    } catch (err) {
      return null;
    }
  }

  function mountLightbox() {
    var cards = document.querySelectorAll(".atlas-card");
    if (!cards.length) return;
    var layer = document.createElement("div");
    layer.className = "atlas-lightbox";
    layer.hidden = true;
    layer.innerHTML = '<div class="atlas-dialog" role="dialog" aria-modal="true" aria-labelledby="atlas-title"><p><button type="button" data-close>Close</button> <button type="button" data-play>Play</button> <button type="button" data-pause>Pause</button> <button type="button" data-step>Step</button></p><h2 id="atlas-title"></h2><div class="atlas-legend"><span><i style="background:#22d3ee"></i>Start node</span><span><i style="background:#fde68a"></i>Moving packet</span><span><i style="background:#a5b4fc"></i>Control point</span></div><p class="atlas-why"></p><object type="image/svg+xml" data=""></object><p><a data-file href="">Open the SVG file</a></p></div>';
    document.body.appendChild(layer);
    var dialog = layer.querySelector(".atlas-dialog");
    var object = layer.querySelector("object");
    var title = layer.querySelector("#atlas-title");
    var why = layer.querySelector(".atlas-why");
    var file = layer.querySelector("[data-file]");
    var last = null;

    function open(card) {
      var source = card.querySelector("object");
      if (!source) return;
      var href = source.getAttribute("data") || "";
      title.textContent = (card.querySelector("h2") || {}).textContent || "Diagram";
      var slug = href.split("/").pop().replace(".svg", "");
      why.textContent = WHY[slug] || "This is a study drawing from the Canon rooms. Read the caption in the SVG and the linked room before you treat a box as a product limit.";
      object.setAttribute("data", href);
      file.setAttribute("href", href);
      layer.hidden = false;
      last = document.activeElement;
      layer.querySelector("[data-close]").focus();
    }
    function close() {
      layer.hidden = true;
      object.setAttribute("data", "");
      if (last && last.focus) last.focus();
    }
    function withSvg(fn) {
      var svg = svgRoot(object);
      if (!svg || !svg.pauseAnimations) {
        why.textContent += " Controls talk to the embedded SVG. If they stay quiet, open the SVG file.";
        return;
      }
      fn(svg);
    }
    cards.forEach(function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest("a")) return;
        open(card);
      });
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(card);
        }
      });
      if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
    });
    layer.querySelector("[data-close]").addEventListener("click", close);
    layer.addEventListener("click", function (event) { if (event.target === layer) close(); });
    layer.querySelector("[data-pause]").addEventListener("click", function () {
      withSvg(function (svg) { svg.pauseAnimations(); });
    });
    layer.querySelector("[data-play]").addEventListener("click", function () {
      withSvg(function (svg) { svg.unpauseAnimations(); });
    });
    layer.querySelector("[data-step]").addEventListener("click", function () {
      withSvg(function (svg) {
        var now = typeof svg.getCurrentTime === "function" ? svg.getCurrentTime() : 0;
        svg.pauseAnimations();
        if (typeof svg.setCurrentTime === "function") svg.setCurrentTime(now + 0.45);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !layer.hidden) close();
    });
    dialog.addEventListener("click", function (event) { event.stopPropagation(); });
  }

  function mountCharts() {
    var tip = document.createElement("div");
    tip.className = "chart-tip";
    tip.hidden = true;
    document.body.appendChild(tip);
    function show(text, event) {
      tip.hidden = false;
      tip.textContent = text;
      tip.style.left = Math.min(event.clientX + 12, window.innerWidth - 220) + "px";
      tip.style.top = Math.min(event.clientY + 12, window.innerHeight - 48) + "px";
    }
    document.querySelectorAll(".lab-chart").forEach(function (chart) {
      var label = chart.getAttribute("data-chart") || chart.getAttribute("aria-label") || "Chart";
      chart.addEventListener("pointermove", function (event) {
        var node = event.target;
        var value = "";
        if (node && node.nextElementSibling && node.tagName === "rect") {
          var next = node.nextElementSibling.nextElementSibling;
          if (next && next.textContent) value = next.textContent;
        }
        show(label + (value ? " · " + value : "") + " · counted in this repository", event);
      });
      chart.addEventListener("pointerleave", function () { tip.hidden = true; });
    });
  }

  function mountMascot() {
    var faces = document.querySelectorAll(".mascot-row svg");
    if (!faces.length) return;
    faces.forEach(function (svg, index) {
      svg.classList.toggle("is-face", index === 0);
      svg.querySelectorAll("circle").forEach(function (circle, circleIndex) {
        if (circleIndex > 0) circle.classList.add("eye");
      });
      var arm = document.createElementNS("http://www.w3.org/2000/svg", "path");
      arm.setAttribute("d", "M58 48 q10 -8 8 10");
      arm.setAttribute("fill", "none");
      arm.setAttribute("stroke", "#1c1917");
      arm.setAttribute("stroke-width", "3");
      arm.setAttribute("class", "wave");
      svg.appendChild(arm);
    });
    var face = 0;
    function show(next) {
      face = next % faces.length;
      faces.forEach(function (svg, index) { svg.classList.toggle("is-face", index === face); });
    }
    document.addEventListener("canon-theme", function () { show(face + 1); });
    if (!reduce) window.setInterval(function () { show(face + 1); }, 90000);
    if ("IntersectionObserver" in window) {
      var sections = document.querySelectorAll("main section");
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) show(face + 1);
        });
      }, { threshold: 0.6 });
      sections.forEach(function (section) { seen.observe(section); });
    }
  }

  function mountAudio() {
    var box = document.querySelector("[data-audio-player]");
    if (!box) return;
    var status = box.querySelector("[data-audio-status]");
    var controls = box.querySelector("[data-audio-controls]");
    var audio = box.querySelector("[data-audio]");
    if (audio && audio.getAttribute("src")) {
      if (status) status.hidden = true;
      if (controls) controls.hidden = false;
    }
    box.querySelectorAll("[data-rate]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (audio) audio.playbackRate = Number(btn.getAttribute("data-rate")) || 1;
      });
    });
  }

  function mountProgress() {
    var ring = document.querySelector("[data-progress-ring]");
    if (!ring) return;
    var opened = 0;
    try {
      var progress = JSON.parse(localStorage.getItem("canon-progress") || "{}");
      opened = Object.keys((progress && progress.rooms) || {}).length;
    } catch (err) { opened = 0; }
    var pct = Math.max(0, Math.min(100, Math.round((opened / 63) * 100)));
    ring.style.setProperty("--p", String(pct));
    var label = ring.querySelector("span");
    if (label) label.textContent = pct + "%";
    ring.setAttribute("aria-label", opened + " of 63 rooms opened in this browser");
  }

  mountLang();
  paintIcons();
  mountLightbox();
  mountCharts();
  mountMascot();
  mountAudio();
  mountProgress();
})();
