/**
 * Guide companion for the Webex Canon lab.
 *
 * Everything factual is loaded from guide/kb, which is built from the
 * rooms, glossary, flows, diagrams, flashcards, and cheat sheets.
 * No request leaves the browser while window.CANON_GUIDE.endpoint is null.
 *
 * Future cloud agent:
 *   window.CANON_GUIDE.endpoint is intentionally unset (null).
 *   Assign a URL string later to POST { message, href, context } only when
 *   the local notes have no match. Expected JSON: { text, href, links }.
 *   Leave it null and every answer stays in this browser.
 */
import { createGuide, mergeKb, blankSession } from "./engine.mjs";

var guideBase = baseUrl();
var session = loadSession();
var guide = null;
var kbPromise = null;
var nudged = false;

var host = document.createElement("div");
host.className = "cg-root";
host.style.fontSize = getComputedStyle(document.body).fontSize;

var monkey = document.createElement("button");
monkey.type = "button";
monkey.className = "cg-monkey";
monkey.setAttribute("aria-expanded", "false");
monkey.setAttribute("aria-controls", "cg-panel");
monkey.setAttribute("aria-label", "Study notes. A student who has read these rooms.");
monkey.innerHTML = monkeySvg();

var nudge = document.createElement("div");
nudge.className = "cg-nudge";
nudge.hidden = true;
nudge.setAttribute("role", "status");

var panel = document.createElement("section");
panel.id = "cg-panel";
panel.className = "cg-panel";
panel.hidden = true;
panel.setAttribute("role", "dialog");
panel.setAttribute("aria-modal", "true");
panel.setAttribute("aria-labelledby", "cg-title");
panel.innerHTML =
  '<header class="cg-bar">' +
  '<div class="cg-who"><span class="cg-avatar" aria-hidden="true">' + avatarSvg() + '</span>' +
  '<div class="cg-id"><h2 id="cg-title">Canon</h2><p class="cg-status"><i class="cg-dot" aria-hidden="true"></i> In the notes</p></div></div>' +
  '<div class="cg-tools">' +
  '<button type="button" data-font-dec aria-label="Smaller text">A−</button>' +
  '<button type="button" data-font-inc aria-label="Larger text">A+</button>' +
  '<button type="button" data-voice aria-pressed="false" aria-label="Read answers aloud">Read</button>' +
  '<button type="button" class="cg-close" data-close aria-label="Close">Close</button>' +
  '</div></header>' +
  '<div class="cg-voice" data-voice-row hidden>' +
  '<label>Voice <select data-voice-name aria-label="Speaking voice"></select></label>' +
  '<label>Speed <select data-voice-rate aria-label="Speaking speed">' +
  '<option value="0.85">0.85×</option><option value="1" selected>1×</option>' +
  '<option value="1.15">1.15×</option><option value="1.3">1.3×</option></select></label></div>' +
  '<div class="cg-log" role="log" aria-label="Messages"></div>' +
  '<div class="cg-live" aria-live="polite" aria-atomic="true"></div>' +
  '<div class="cg-chips" role="group" aria-label="Quick replies"></div>' +
  '<form class="cg-form"><button type="button" class="cg-mic" data-mic hidden aria-label="Voice input">Mic</button>' +
  '<input type="text" aria-label="Ask about this page" placeholder="Ask about this page" autocomplete="off">' +
  '<button type="submit">Send</button></form>' +
  '<span class="cg-pointer" aria-hidden="true"></span>';

var tourLayer = document.createElement("div");
tourLayer.className = "cg-tour";
tourLayer.hidden = true;
tourLayer.innerHTML =
  '<div class="cg-tour-back" data-tour-end></div>' +
  '<div class="cg-spot" hidden></div>' +
  '<div class="cg-callout" role="dialog" aria-modal="true" aria-label="Page tour">' +
  '<p></p><div class="cg-callout-actions"><button type="button" data-tour-next>Next</button>' +
  '<button type="button" data-tour-end>Done</button></div></div>';

host.appendChild(nudge);
host.appendChild(monkey);
host.appendChild(panel);
host.appendChild(tourLayer);
document.body.appendChild(host);

var css = document.createElement("link");
css.rel = "stylesheet";
css.href = guideBase + "guide/guide.css";
document.head.appendChild(css);

var log = panel.querySelector(".cg-log");
var live = panel.querySelector(".cg-live");
var chipRow = panel.querySelector(".cg-chips");
var form = panel.querySelector(".cg-form");
var input = form.querySelector("input");
var voiceBtn = panel.querySelector("[data-voice]");
var voiceRow = panel.querySelector("[data-voice-row]");
var voiceName = panel.querySelector("[data-voice-name]");
var voiceRate = panel.querySelector("[data-voice-rate]");
var micBtn = panel.querySelector("[data-mic]");
var tourState = null;
var targetEl = null;
var greetedPath = "";
var fontScale = loadFontScale();
var voicePref = loadVoice();
var recognition = null;

installApi();
streakDays();
syncFont();
place();
bind();
resumeTour();
scheduleNudge();

function baseUrl() {
  var nodes = document.querySelectorAll("script[src]");
  for (var i = 0; i < nodes.length; i += 1) {
    var src = nodes[i].src || "";
    var at = src.indexOf("guide/guide.js");
    if (at !== -1) return src.slice(0, at);
  }
  return new URL("./", location.href).href;
}

function abs(href) {
  if (!href) return "";
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (/^\s*javascript:/i.test(href)) return "";
  try {
    return new URL(String(href).replace(/^\//, ""), guideBase || location.href).href;
  } catch (error) {
    return "";
  }
}

function motionReduced() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return document.documentElement.dataset.motion === "reduce";
}

function loadFontScale() {
  try {
    var saved = Number(sessionStorage.getItem("cg-font"));
    if (saved >= 0.85 && saved <= 1.4) return saved;
  } catch (error) { /* keep the page size */ }
  return 1;
}

function syncFont() {
  var base = parseFloat(getComputedStyle(document.body).fontSize) || 16.5;
  host.style.fontSize = (base * fontScale) + "px";
}

function stepFont(dir) {
  var steps = [0.9, 1, 1.12, 1.28];
  var index = 0;
  steps.forEach(function (step, at) {
    if (Math.abs(step - fontScale) < 0.05) index = at;
  });
  index = Math.max(0, Math.min(steps.length - 1, index + dir));
  fontScale = steps[index];
  try { sessionStorage.setItem("cg-font", String(fontScale)); } catch (error) { /* page size still applies */ }
  syncFont();
}

function fileOf(href) {
  var clean = String(href || "").split("#")[0].split("?")[0];
  var parts = clean.split("/");
  var last = parts[parts.length - 1];
  return last || "index.html";
}

function hereFile() {
  var last = location.pathname.split("/").pop();
  return last || "index.html";
}

function context() {
  var recording = null;
  var audios = document.querySelectorAll("audio");
  for (var i = 0; i < audios.length; i += 1) {
    if (!audios[i].paused && !audios[i].ended) {
      var slot = audios[i].closest(".audio-slot, [data-audio-player], .lab-audio");
      var heading = slot && slot.querySelector("h3, p");
      recording = {
        title: heading ? heading.textContent.trim() : "Recording",
        src: audios[i].currentSrc || ""
      };
      break;
    }
  }
  return {
    room: document.body.getAttribute("data-room") || "",
    roomTitle: document.body.getAttribute("data-room-title") || "",
    page: hereFile(),
    section: visibleSection(),
    recording: recording,
    streak: streakDays(),
    today: new Date().toISOString().slice(0, 10)
  };
}

function visibleSection() {
  var sections = document.querySelectorAll("main section[id], article section[id]");
  var best = "";
  var bestTop = Infinity;
  for (var i = 0; i < sections.length; i += 1) {
    var rect = sections[i].getBoundingClientRect();
    if (rect.bottom > 90 && rect.top < 180) return sections[i].id;
    if (rect.top >= 0 && rect.top < bestTop) {
      bestTop = rect.top;
      best = sections[i].id;
    }
  }
  return best;
}

function loadSession() {
  try {
    var saved = JSON.parse(sessionStorage.getItem("cg-session") || "null");
    if (saved && typeof saved === "object" && saved.seen) return saved;
  } catch (error) {
    return blankSession();
  }
  return blankSession();
}

function saveSession() {
  try {
    sessionStorage.setItem("cg-session", JSON.stringify(session));
  } catch (error) {
    return;
  }
}

function streakDays() {
  var today = new Date().toISOString().slice(0, 10);
  var days = [];
  try {
    days = JSON.parse(localStorage.getItem("cg-days") || "[]");
  } catch (error) {
    days = [];
  }
  if (days.indexOf(today) === -1) days.push(today);
  days = days.slice(-30);
  try {
    localStorage.setItem("cg-days", JSON.stringify(days));
  } catch (error) {
    return 1;
  }
  var have = {};
  days.forEach(function (day) { have[day] = 1; });
  var streak = 0;
  var cursor = new Date(today + "T00:00:00Z");
  while (have[cursor.toISOString().slice(0, 10)]) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function loadVoice() {
  var pref = { on: false, rate: "1", uri: "" };
  try {
    var saved = JSON.parse(localStorage.getItem("cg-voice") || "null");
    if (saved && typeof saved === "object") {
      pref.on = !!saved.on;
      if (saved.rate) pref.rate = String(saved.rate);
      if (saved.uri) pref.uri = saved.uri;
    }
  } catch (error) {
    return pref;
  }
  return pref;
}

function saveVoice() {
  try {
    localStorage.setItem("cg-voice", JSON.stringify(voicePref));
  } catch (error) {
    return;
  }
}

function ensureKb() {
  if (kbPromise) return kbPromise;
  kbPromise = fetch(guideBase + "guide/kb/index.json")
    .then(function (res) { if (!res.ok) throw new Error("kb"); return res.json(); })
    .then(function (index) {
      var names = ["rooms.json", "quizzes.json", "cards.json", "lessons.json", "tours.json"].concat(index.factFiles || []);
      var parts = { index: index };
      var chain = Promise.resolve();
      names.forEach(function (name) {
        chain = chain.then(function () {
          return fetch(guideBase + "guide/kb/" + name).then(function (res) {
            if (!res.ok) throw new Error(name);
            return res.json();
          }).then(function (json) {
            parts[name] = json;
            return new Promise(function (resolve) { window.setTimeout(resolve, 0); });
          });
        });
      });
      return chain.then(function () {
        parts.rooms = parts["rooms.json"];
        parts.quizzes = parts["quizzes.json"];
        parts.cards = parts["cards.json"];
        parts.lessons = parts["lessons.json"];
        parts.tours = parts["tours.json"];
        guide = createGuide(mergeKb(parts));
        return guide;
      });
    })
    .catch(function (error) {
      kbPromise = null;
      throw error;
    });
  return kbPromise;
}

function installApi() {
  var api = window.CANON_GUIDE || {};
  if (!("endpoint" in api)) api.endpoint = null;
  api.endpointNote = "Leave endpoint null. Set a URL later to POST {message, href, context} only when local notes have no match.";
  api.askLocal = function (message, ctx) {
    return ensureKb().then(function (ready) {
      return ready.route(message, blankSession(), ctx || context()).reply;
    });
  };
  api.ask = function (message) {
    return ask(message).then(function (reply) { return reply; });
  };
  window.CANON_GUIDE = api;
}

function ask(message) {
  var ctx = context();
  return ensureKb().then(function (ready) {
    var local = ready.route(message, session, ctx);
    session = local.session;
    saveSession();
    var endpoint = window.CANON_GUIDE && window.CANON_GUIDE.endpoint;
    if (!endpoint || local.reply.kind !== "fallback") return local.reply;
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message, href: location.href, context: ctx })
    }).then(function (res) {
      if (!res.ok) throw new Error("endpoint");
      return res.json();
    }).then(function (data) {
      if (!data || typeof data.text !== "string" || !data.text) return local.reply;
      return {
        kind: "answer",
        text: "From the connected agent, not from the local notes: " + data.text,
        href: typeof data.href === "string" ? data.href : "",
        links: Array.isArray(data.links) ? data.links : [],
        chips: local.reply.chips,
        localOnly: false
      };
    }).catch(function () {
      return local.reply;
    });
  });
}

function focusables(root) {
  return Array.prototype.slice.call(root.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])")).filter(function (el) {
    return !el.hidden && el.offsetParent !== null;
  });
}

function trap(event, root) {
  if (event.key !== "Tab") return;
  var nodes = focusables(root);
  if (!nodes.length) return;
  var first = nodes[0];
  var last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function scrollLog() {
  log.scrollTop = log.scrollHeight;
}

function say(text, links, who) {
  var bubble = document.createElement("div");
  bubble.className = "cg-bubble " + (who === "user" ? "is-user" : "is-bot");
  var body = document.createElement("p");
  bubble.appendChild(body);
  log.appendChild(bubble);
  scrollLog();
  function finish() {
    var usable = (links || []).filter(function (link) { return link && link.href; });
    if (usable.length) {
      var nav = document.createElement("p");
      nav.className = "cg-links";
      usable.forEach(function (link, index) {
        if (index) nav.appendChild(document.createTextNode(" "));
        var anchor = document.createElement("a");
        anchor.href = abs(link.href);
        anchor.textContent = link.title || link.href;
        nav.appendChild(anchor);
      });
      bubble.appendChild(nav);
    }
    scrollLog();
    if (who !== "user") {
      live.textContent = text;
      speak(text);
    }
  }
  if (who === "user" || motionReduced()) {
    body.textContent = text;
    finish();
    return;
  }
  var typing = document.createElement("span");
  typing.className = "cg-typing";
  typing.setAttribute("aria-hidden", "true");
  typing.innerHTML = "<i></i><i></i><i></i>";
  body.appendChild(typing);
  window.setTimeout(function () {
    body.textContent = text;
    finish();
  }, 220);
}

function setChips(labels, extra) {
  chipRow.innerHTML = "";
  (labels || []).concat(extra || []).forEach(function (label) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "cg-chip" + (label === "Start the 1-hour course" ? " is-course" : "");
    button.textContent = label;
    button.addEventListener("click", function () {
      submitText(label);
    });
    chipRow.appendChild(button);
  });
}

function deliver(reply) {
  if (!reply) return;
  if (reply.kind === "voice") applyVoice(reply.voice === "on");
  if (reply.kind === "tour" && reply.tour) {
    say(reply.text, reply.links, "bot");
    setChips(reply.chips, reply.extraChips);
    beginTour(reply.tour.steps || [], 0);
    return;
  }
  say(reply.text, reply.links, "bot");
  if (reply.follow) {
    say(reply.follow.text, reply.follow.links, "bot");
    setChips(reply.follow.chips || reply.chips, reply.follow.extraChips || reply.extraChips);
    return;
  }
  setChips(reply.chips, reply.extraChips);
}

function submitText(text) {
  var value = String(text || "").trim();
  if (!value) return;
  hideNudge(false);
  say(value, [], "user");
  var pending = document.createElement("div");
  pending.className = "cg-bubble is-bot";
  pending.innerHTML = '<p><span class="cg-typing" aria-hidden="true"><i></i><i></i><i></i></span></p>';
  log.appendChild(pending);
  scrollLog();
  ask(value).then(function (reply) {
    pending.remove();
    deliver(reply);
  }).catch(function () {
    pending.remove();
    say("I couldn't read the study notes in this browser, so I won't guess.", [{ href: "glossary.html", title: "Glossary" }], "bot");
  });
}

function openPanel() {
  panel.hidden = false;
  monkey.setAttribute("aria-expanded", "true");
  hideNudge(false);
  if (greetedPath !== location.pathname) {
    greetedPath = location.pathname;
    var room = document.body.getAttribute("data-room-title");
    var title = document.title.replace(/\s*[·|].*$/, "");
    var line = room
      ? "You're in " + room + ". I can walk this room with you. I only repeat the notes. Start the 1-hour course when you want every track, with a checkpoint at the end of each one."
      : "You're on " + title + ". Ask how to use this page. I only repeat the notes. Start the 1-hour course when you want every track, with a checkpoint at the end of each one.";
    if (session.covered && session.covered.length) {
      line += " So far this session we've touched " + session.covered.length + " room" + (session.covered.length === 1 ? "" : "s") + ".";
    }
    say(line, [], "bot");
    setChips(["Start the 1-hour course", "How do I use this?", "Quiz me", "Flashcards", "My progress"]);
  }
  host.classList.toggle("is-open", true);
  input.focus();
  place();
}

function closePanel() {
  if (panel.hidden) return;
  panel.hidden = true;
  host.classList.remove("is-open");
  host.classList.remove("is-sheet");
  monkey.setAttribute("aria-expanded", "false");
  monkey.focus();
  place();
}

function boop() {
  monkey.classList.remove("is-boop");
  void monkey.offsetWidth;
  monkey.classList.add("is-boop");
}

function applyVoice(on) {
  voicePref.on = !!on;
  saveVoice();
  voiceBtn.setAttribute("aria-pressed", voicePref.on ? "true" : "false");
  voiceRow.hidden = !voicePref.on;
  if (!voicePref.on && window.speechSynthesis) window.speechSynthesis.cancel();
  if (voicePref.on) fillVoices();
}

function fillVoices() {
  if (!window.speechSynthesis) return;
  var voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  var current = voiceName.value || voicePref.uri;
  voiceName.innerHTML = "";
  voices.forEach(function (voice) {
    var option = document.createElement("option");
    option.value = voice.voiceURI;
    option.textContent = voice.name + " (" + voice.lang + ")";
    voiceName.appendChild(option);
  });
  var match = voices.some(function (voice) { return voice.voiceURI === current; });
  voiceName.value = match ? current : (voices.filter(function (voice) { return /^en/i.test(voice.lang); })[0] || voices[0]).voiceURI;
  voicePref.uri = voiceName.value;
  saveVoice();
}

function speak(text) {
  if (!voicePref.on || !window.speechSynthesis) return;
  var plain = String(text || "").replace(/\s+/g, " ").trim();
  if (!plain) return;
  window.speechSynthesis.cancel();
  var utter = new SpeechSynthesisUtterance(plain);
  var rate = Number(voicePref.rate || voiceRate.value || 1);
  utter.rate = rate > 0 ? rate : 1;
  var voices = window.speechSynthesis.getVoices();
  var chosen = null;
  voices.forEach(function (voice) {
    if (!chosen && voice.voiceURI === voicePref.uri) chosen = voice;
  });
  if (chosen) utter.voice = chosen;
  window.speechSynthesis.speak(utter);
}

function setupMic() {
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Rec) {
    micBtn.hidden = true;
    return;
  }
  micBtn.hidden = false;
  recognition = new Rec();
  recognition.lang = document.documentElement.lang || "en-US";
  recognition.interimResults = false;
  recognition.onresult = function (event) {
    var said = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : "";
    if (said) submitText(said);
  };
  recognition.onend = function () {
    micBtn.setAttribute("aria-pressed", "false");
  };
}

function onScreen(el) {
  if (!el || el.hidden || el.closest(".cg-root")) return null;
  if (el.matches(".v4-toc, .toc, .section-dock") && !el.querySelector("a, button")) return null;
  var style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.pointerEvents === "none") return null;
  var rect = el.getBoundingClientRect();
  if (rect.width < 12 || rect.height < 12) return null;
  if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return null;
  return rect;
}

function overlap(a, b, pad) {
  return a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
}

var placeQueued = false;
function queuePlace() {
  if (placeQueued) return;
  placeQueued = true;
  window.requestAnimationFrame(function () {
    placeQueued = false;
    place();
  });
}

function obstacleBoxes() {
  var boxes = [];
  var selectors = [
    ".topbar", ".nav-panel", ".phone-dock", ".phone-menu", ".phone-menu-btn",
    ".site-footer", ".lab-footer", ".v4-toc", ".toc", ".section-dock",
    ".hud-panel", ".hud-sheet-toggle", ".to-top", ".settings-panel",
    ".uni-menu", ".lab-links", ".v4-sidebar", ".monkey", ".monkey-note",
    ".v4-suggest", ".theme-pop", ".v4-menu"
  ];
  selectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (selector === ".to-top" && !el.classList.contains("show")) return;
      var rect = onScreen(el);
      if (rect) boxes.push(rect);
    });
  });
  return boxes;
}

function boxAt(right, bottom, width, height) {
  return {
    left: window.innerWidth - right - width,
    right: window.innerWidth - right,
    top: window.innerHeight - bottom - height,
    bottom: window.innerHeight - bottom
  };
}

function fits(box, boxes) {
  if (box.left < 6 || box.top < 6 || box.right > window.innerWidth - 6 || box.bottom > window.innerHeight - 6) return false;
  return !boxes.some(function (obstacle) { return overlap(box, obstacle, 14); });
}

function findSlot(monkeyBox, boxes) {
  var heights = [480, 440, 420, 380];
  var anchors = [
    { bottom: window.innerHeight - (monkeyBox.top - 18), right: window.innerWidth - monkeyBox.right },
    { bottom: window.innerHeight - monkeyBox.bottom, right: window.innerWidth - (monkeyBox.left - 16) }
  ];
  var anchorIndex = 0;
  var shift = 0;
  var heightIndex = 0;
  for (anchorIndex = 0; anchorIndex < anchors.length; anchorIndex += 1) {
    for (shift = 0; shift <= 320; shift += 32) {
      for (heightIndex = 0; heightIndex < heights.length; heightIndex += 1) {
        var right = anchors[anchorIndex].right + shift;
        var bottom = anchors[anchorIndex].bottom;
        var width = Math.min(380, window.innerWidth - right - 8);
        var height = heights[heightIndex];
        if (width < 240) continue;
        var slot = boxAt(right, bottom, width, height);
        if (overlap(slot, monkeyBox, 2)) continue;
        if (!fits(slot, boxes)) continue;
        return { right: right, bottom: bottom, width: width, height: height, side: anchorIndex === 0 ? "above" : "beside" };
      }
    }
  }
  return null;
}

function contentBoxes() {
  var boxes = [];
  document.querySelectorAll(".world-title, .world-lede, .world-kicker, .hero-copy, .hero-actions, main h1").forEach(function (el) {
    var rect = onScreen(el);
    if (rect) boxes.push(rect);
  });
  return boxes;
}

function place() {
  syncFont();
  var boxes = obstacleBoxes();
  var story = contentBoxes();
  var width = 104;
  var height = 120;
  var needSlot = !panel.hidden || !nudge.hidden;
  var chosen = null;
  var clearMonkey = null;
  var bottom = 12;
  var right = 12;
  for (bottom = 12; bottom < window.innerHeight - height && !chosen; bottom += 12) {
    var rightLimit = window.innerWidth - width - 6;
    for (right = 12; right <= rightLimit && !chosen; right += 12) {
      var monkeyBox = boxAt(right, bottom, width, height);
      if (!fits(monkeyBox, boxes)) continue;
      if (!clearMonkey) clearMonkey = { right: right, bottom: bottom };
      if (!needSlot) {
        chosen = { right: right, bottom: bottom, slot: null };
        break;
      }
      var slot = findSlot(monkeyBox, boxes.concat(story));
      if (slot) chosen = { right: right, bottom: bottom, slot: slot };
    }
  }
  if (!chosen && clearMonkey) chosen = { right: clearMonkey.right, bottom: clearMonkey.bottom, slot: null };
  if (!chosen) chosen = { right: 12, bottom: 12, slot: null };
  host.style.setProperty("--cg-right", chosen.right + "px");
  host.style.setProperty("--cg-bottom", chosen.bottom + "px");
  var sheet = window.innerWidth <= 720 && !panel.hidden;
  host.classList.toggle("is-sheet", sheet);
  host.classList.toggle("is-open", !panel.hidden);
  if (sheet) {
    var panelBottom = chosen.bottom + height + 12;
    var topLimit = 64;
    var bar = document.querySelector(".topbar");
    if (bar) {
      var barBox = bar.getBoundingClientRect();
      if (barBox.height > 20 && barBox.bottom > 0 && barBox.top < 160) topLimit = Math.round(barBox.bottom + 8);
    }
    var panelMax = Math.max(280, window.innerHeight - panelBottom - topLimit);
    host.style.setProperty("--cg-panel-right", "0px");
    host.style.setProperty("--cg-panel-bottom", panelBottom + "px");
    host.style.setProperty("--cg-panel-width", "100vw");
    host.style.setProperty("--cg-panel-max", panelMax + "px");
    panel.classList.add("is-above");
    panel.classList.remove("is-beside");
  } else if (chosen.slot) {
    host.style.setProperty("--cg-panel-right", chosen.slot.right + "px");
    host.style.setProperty("--cg-panel-bottom", chosen.slot.bottom + "px");
    host.style.setProperty("--cg-panel-width", chosen.slot.width + "px");
    host.style.setProperty("--cg-panel-max", chosen.slot.height + "px");
    host.style.setProperty("--cg-nudge-right", chosen.slot.right + "px");
    host.style.setProperty("--cg-nudge-bottom", chosen.slot.bottom + "px");
    panel.classList.toggle("is-above", chosen.slot.side !== "beside");
    panel.classList.toggle("is-beside", chosen.slot.side === "beside");
  } else {
    host.style.setProperty("--cg-panel-right", chosen.right + "px");
    host.style.setProperty("--cg-panel-bottom", (chosen.bottom + height + 16) + "px");
    host.style.setProperty("--cg-panel-width", Math.min(380, window.innerWidth - chosen.right - 8) + "px");
    host.style.setProperty("--cg-panel-max", Math.max(220, window.innerHeight - chosen.bottom - height - 24) + "px");
    panel.classList.add("is-above");
    panel.classList.remove("is-beside");
  }
}

function hideNudge(persist) {
  nudge.hidden = true;
  if (persist) {
    try { localStorage.setItem("cg-nudge-off", "1"); } catch (error) { return; }
  }
}

function scheduleNudge() {
  var off = false;
  try { off = localStorage.getItem("cg-nudge-off") === "1" || sessionStorage.getItem("cg-nudge-shown") === "1"; } catch (error) { off = true; }
  if (off) return;
  window.setTimeout(function () {
    if (nudged || !panel.hidden || !tourLayer.hidden) return;
    try {
      if (localStorage.getItem("cg-nudge-off") === "1") return;
      sessionStorage.setItem("cg-nudge-shown", "1");
    } catch (error) {
      return;
    }
    nudged = true;
    var room = document.body.getAttribute("data-room");
    nudge.innerHTML = "";
    var copy = document.createElement("p");
    copy.textContent = room ? "Want a 2-minute tour of this room?" : "Want a 2-minute tour of this page?";
    var actions = document.createElement("div");
    actions.className = "cg-nudge-actions";
    var yes = document.createElement("button");
    yes.type = "button";
    yes.textContent = "Yes";
    var no = document.createElement("button");
    no.type = "button";
    no.textContent = "Not now";
    yes.addEventListener("click", function () {
      hideNudge(true);
      openPanel();
      submitText(room ? "tour this room" : "tour this page");
    });
    no.addEventListener("click", function () { hideNudge(true); });
    actions.appendChild(yes);
    actions.appendChild(no);
    nudge.appendChild(copy);
    nudge.appendChild(actions);
    nudge.hidden = false;
    place();
    window.setTimeout(function () {
      if (!nudge.hidden) hideNudge(false);
    }, 20000);
  }, 16000);
}

function clearTarget() {
  if (targetEl) targetEl.classList.remove("cg-target");
  targetEl = null;
}

function findStep(step) {
  if (!step) return null;
  if (step.selector) {
    var parts = step.selector.split(",");
    for (var i = 0; i < parts.length; i += 1) {
      var el = document.querySelector(parts[i].trim());
      if (el) return el;
    }
  }
  if (step.find && step.matchText) {
    var nodes = document.querySelectorAll(step.find);
    var want = step.matchText.toLowerCase();
    for (var n = 0; n < nodes.length; n += 1) {
      if ((nodes[n].textContent || "").toLowerCase().indexOf(want) !== -1) return nodes[n].closest("article") || nodes[n];
    }
  }
  return null;
}

function placeTour() {
  if (!tourState) return;
  var step = tourState.steps[tourState.index];
  if (!step) {
    endTour();
    return;
  }
  if (fileOf(step.href) !== hereFile()) {
    try {
      sessionStorage.setItem("cg-tour", JSON.stringify({ steps: tourState.steps, index: tourState.index, at: Date.now() }));
    } catch (error) {
      return;
    }
    location.href = abs(step.href);
    return;
  }
  var el = findStep(step);
  if (!el) {
    tourState.index += 1;
    if (tourState.index >= tourState.steps.length) endTour();
    else placeTour();
    return;
  }
  clearTarget();
  targetEl = el;
  el.classList.add("cg-target");
  el.style.scrollMarginTop = "88px";
  el.style.scrollMarginBottom = "140px";
  el.scrollIntoView({ block: "center", inline: "nearest", behavior: motionReduced() ? "auto" : "smooth" });
  window.setTimeout(function () {
    if (!tourState) return;
    var rect = el.getBoundingClientRect();
    var spot = tourLayer.querySelector(".cg-spot");
    var callout = tourLayer.querySelector(".cg-callout");
    spot.hidden = false;
    spot.style.top = Math.max(8, rect.top - 6) + "px";
    spot.style.left = Math.max(8, rect.left - 6) + "px";
    spot.style.width = Math.min(rect.width + 12, window.innerWidth - 16) + "px";
    spot.style.height = Math.min(rect.height + 12, window.innerHeight - 16) + "px";
    callout.querySelector("p").textContent = step.text || "";
    var next = tourLayer.querySelector("[data-tour-next]");
    next.textContent = tourState.index === tourState.steps.length - 1 ? "Finish" : "Next";
    var top = rect.bottom + 12;
    if (top > window.innerHeight - 160) top = Math.max(12, rect.top - 160);
    callout.style.top = top + "px";
    callout.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - 320)) + "px";
    next.focus();
  }, motionReduced() ? 0 : 280);
}

function beginTour(steps, index) {
  if (!steps.length) return;
  tourState = { steps: steps, index: index || 0 };
  tourLayer.hidden = false;
  hideNudge(false);
  try { sessionStorage.removeItem("cg-tour"); } catch (error) { /* keep going */ }
  placeTour();
}

function endTour() {
  tourState = null;
  tourLayer.hidden = true;
  clearTarget();
  try { sessionStorage.removeItem("cg-tour"); } catch (error) { return; }
  if (!panel.hidden) input.focus();
  else monkey.focus();
}

function resumeTour() {
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem("cg-tour") || "null"); } catch (error) { saved = null; }
  if (!saved || !saved.steps || Date.now() - saved.at > 10 * 60 * 1000) return;
  var step = saved.steps[saved.index];
  if (!step || fileOf(step.href) !== hereFile()) {
    try { sessionStorage.removeItem("cg-tour"); } catch (error) { return; }
    return;
  }
  window.setTimeout(function () { beginTour(saved.steps, saved.index); }, 350);
}

function bind() {
  monkey.addEventListener("click", function () {
    boop();
    if (panel.hidden) {
      openPanel();
      return;
    }
    ensureKb().then(function (ready) {
      var touched = ready.touch(session);
      session = touched.session;
      saveSession();
      deliver(touched.reply);
    }).catch(function () {
      say("I couldn't read the study notes in this browser, so I won't guess.", [], "bot");
    });
  });
  panel.querySelector("[data-close]").addEventListener("click", closePanel);
  panel.querySelector("[data-font-dec]").addEventListener("click", function () { stepFont(-1); });
  panel.querySelector("[data-font-inc]").addEventListener("click", function () { stepFont(1); });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = input.value;
    input.value = "";
    submitText(text);
  });
  voiceBtn.addEventListener("click", function () {
    if (!window.speechSynthesis) {
      say("Read-aloud isn't available in this browser.", [], "bot");
      return;
    }
    applyVoice(!voicePref.on);
    say(voicePref.on ? "Read-aloud is on. Pick a voice and a speed if you want." : "Read-aloud is off.", [], "bot");
  });
  voiceName.addEventListener("change", function () {
    voicePref.uri = voiceName.value;
    saveVoice();
  });
  voiceRate.addEventListener("change", function () {
    voicePref.rate = voiceRate.value;
    saveVoice();
  });
  if (window.speechSynthesis) {
    fillVoices();
    window.speechSynthesis.addEventListener("voiceschanged", fillVoices);
    voiceRate.value = voicePref.rate || "1";
    applyVoice(voicePref.on);
  } else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Read aloud isn't available in this browser.";
  }
  setupMic();
  micBtn.addEventListener("click", function () {
    if (!recognition) return;
    try {
      micBtn.setAttribute("aria-pressed", "true");
      recognition.start();
    } catch (error) {
      micBtn.setAttribute("aria-pressed", "false");
    }
  });
  tourLayer.querySelector("[data-tour-next]").addEventListener("click", function () {
    if (!tourState) return;
    tourState.index += 1;
    if (tourState.index >= tourState.steps.length) endTour();
    else placeTour();
  });
  tourLayer.querySelectorAll("[data-tour-end]").forEach(function (button) {
    button.addEventListener("click", endTour);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Tab") {
      if (!tourLayer.hidden) trap(event, tourLayer.querySelector(".cg-callout"));
      else if (!panel.hidden) trap(event, panel);
      return;
    }
    if (event.key !== "Escape") return;
    if (!tourLayer.hidden) endTour();
    else if (!panel.hidden) closePanel();
  });
  window.addEventListener("scroll", queuePlace, { passive: true });
  window.addEventListener("resize", queuePlace);
  window.setTimeout(queuePlace, 400);
  window.setTimeout(queuePlace, 1200);
  var fontWatch = new MutationObserver(syncFont);
  fontWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-font", "data-motion"] });
  fontWatch.observe(document.body, { attributes: true, attributeFilter: ["style", "class", "data-font"] });
}

function avatarSvg() {
  return '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="18" fill="#f6b73c"/>' +
    '<circle cx="18" cy="30" r="6" fill="#f6b73c"/><circle cx="46" cy="30" r="6" fill="#f6b73c"/>' +
    '<ellipse cx="26" cy="33" rx="3" ry="3.4" fill="#fff"/><ellipse cx="38" cy="33" rx="3" ry="3.4" fill="#fff"/>' +
    '<circle cx="26.6" cy="33.4" r="1.4" fill="#1c1917"/><circle cx="38.6" cy="33.4" r="1.4" fill="#1c1917"/>' +
    '<path d="M26 40c2.4 3 9.6 3 12 0" fill="none" stroke="#1c1917" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M16 24c4-8 28-8 32 0" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/></svg>';
}

function monkeySvg() {
  return '<span class="cg-aura" aria-hidden="true"></span>' +
    '<span class="cg-glow" aria-hidden="true"></span>' +
    '<span class="cg-spark" style="--a:0deg;--d:0s" aria-hidden="true"></span>' +
    '<span class="cg-spark" style="--a:60deg;--d:-1.1s" aria-hidden="true"></span>' +
    '<span class="cg-spark" style="--a:120deg;--d:-2.2s" aria-hidden="true"></span>' +
    '<span class="cg-spark" style="--a:180deg;--d:-3.2s" aria-hidden="true"></span>' +
    '<span class="cg-spark" style="--a:240deg;--d:-4.3s" aria-hidden="true"></span>' +
    '<span class="cg-spark" style="--a:300deg;--d:-5.4s" aria-hidden="true"></span>' +
    '<span class="cg-float" aria-hidden="true"><svg viewBox="0 0 120 140" role="img" aria-hidden="true">' +
    '<ellipse cx="60" cy="126" rx="28" ry="8" fill="#020617" opacity=".35"/>' +
    '<path d="M92 96c16 8 18 22 8 28" fill="none" stroke="#e8a317" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M34 78c-16 6-18 22-6 28" fill="none" stroke="#e8a317" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M86 76c14 2 16 16 8 22" fill="none" stroke="#e8a317" stroke-width="8" stroke-linecap="round"/>' +
    '<rect x="38" y="74" width="44" height="40" rx="18" fill="#f6b73c"/>' +
    '<circle cx="28" cy="58" r="10" fill="#f6b73c"/><circle cx="92" cy="58" r="10" fill="#f6b73c"/>' +
    '<circle cx="28" cy="58" r="5" fill="#7c4a12"/><circle cx="92" cy="58" r="5" fill="#7c4a12"/>' +
    '<circle cx="60" cy="58" r="30" fill="#f6b73c"/>' +
    '<ellipse cx="60" cy="66" rx="16" ry="13" fill="#ffe7a3"/>' +
    '<g class="cg-eye"><ellipse cx="50" cy="56" rx="5" ry="6" fill="#fff"/><circle cx="51" cy="57" r="2.4" fill="#1c1917"/></g>' +
    '<g class="cg-eye"><ellipse cx="70" cy="56" rx="5" ry="6" fill="#fff"/><circle cx="71" cy="57" r="2.4" fill="#1c1917"/></g>' +
    '<path d="M50 72c4 6 16 6 20 0" fill="none" stroke="#1c1917" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M30 42c8-16 52-16 60 0" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>' +
    '<rect x="18" y="46" width="14" height="18" rx="6" fill="#0f172a"/>' +
    '<rect x="88" y="46" width="14" height="18" rx="6" fill="#0f172a"/>' +
    '<path d="M96 64c8 10 4 22-6 24" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="88" cy="90" r="3" fill="#22d3ee"/>' +
    '</svg></span>';
}
