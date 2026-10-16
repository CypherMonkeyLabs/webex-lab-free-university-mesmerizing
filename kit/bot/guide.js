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
var along = { active: false, paused: false, sections: [], index: 0, sentence: 0 };
var alongToken = 0;
var ambience = { ctx: null, nodes: [] };

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
  '<option value="0.85">0.85×</option><option value="0.92">0.92×</option><option value="1">1×</option>' +
  '<option value="1.08">1.08×</option></select></label>' +
  '<label>Pitch <select data-voice-pitch aria-label="Speaking pitch">' +
  '<option value="0.9">Lower</option><option value="0.95">Calm</option><option value="1">Even</option><option value="1.05">Brighter</option></select></label>' +
  '<div class="cg-transport" role="group" aria-label="Playback">' +
  '<button type="button" data-voice-pause>Pause</button>' +
  '<button type="button" data-voice-resume>Resume</button>' +
  '<button type="button" data-voice-stop>Stop</button></div></div>' +
  '<section class="cg-talk" data-talk hidden>' +
  '<p class="cg-talk-status" data-talk-status>Voice input is ready when this browser supports it.</p>' +
  '<p class="cg-transcript" data-transcript aria-live="polite"></p>' +
  '<p class="cg-spoken" data-spoken hidden></p>' +
  '<div class="cg-talk-actions">' +
  '<button type="button" data-talk-send>Send what I said</button>' +
  '<button type="button" data-talk-close>Close voice input</button></div>' +
  '<p class="cg-talk-fallback" data-talk-fallback hidden>This browser has no speech recognition. Type in the box. Read-aloud still uses the speech voices this browser offers.</p></section>' +
  '<div class="cg-along" role="group" aria-label="Read along">' +
  '<button type="button" data-along-start>Read along</button>' +
  '<button type="button" data-along-pause>Pause</button>' +
  '<button type="button" data-along-resume>Resume</button>' +
  '<button type="button" data-along-next>Next section</button></div>' +
  '<label class="cg-amb">Sound theme <select data-ambience aria-label="Sound theme">' +
  '<option value="">Off</option><option value="pad">Soft pad</option><option value="rain">Soft rain</option></select></label>' +
  '<ol class="cg-outline" data-outline hidden></ol>' +
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
var voicePitch = panel.querySelector("[data-voice-pitch]");
var micBtn = panel.querySelector("[data-mic]");
var talk = panel.querySelector("[data-talk]");
var talkStatus = panel.querySelector("[data-talk-status]");
var transcriptEl = panel.querySelector("[data-transcript]");
var spokenEl = panel.querySelector("[data-spoken]");
var talkFallback = panel.querySelector("[data-talk-fallback]");
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
  var pref = { on: false, rate: "0.92", pitch: "0.95", uri: "" };
  try {
    var saved = JSON.parse(localStorage.getItem("cg-voice") || "null");
    if (saved && typeof saved === "object") {
      pref.on = !!saved.on;
      if (saved.rate) pref.rate = String(saved.rate);
      if (saved.pitch) pref.pitch = String(saved.pitch);
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
  if (reply.correct === true) setPose("yes");
  else if (reply.correct === false) setPose("no");
  else if (reply.kind === "fallback") setPose("think");
  else setPose("greet");
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

function pageClip() {
  var title = document.body.getAttribute("data-room-title") || document.querySelector("h1");
  var name = title && title.textContent ? title.textContent.trim() : String(title || document.title);
  var lede = document.querySelector("main .lede, .world-lede");
  var bits = [];
  document.querySelectorAll(".takeaways li").forEach(function (li, index) {
    if (index < 3) bits.push(li.textContent.replace(/\s+/g, " ").trim());
  });
  var line = "One-minute clip for " + name + ". ";
  if (lede) line += lede.textContent.replace(/\s+/g, " ").trim() + " ";
  if (bits.length) line += bits.join(" ");
  else line += "Open Start here, then a room. I only read what is already on the page.";
  say(line, [{ href: "start.html", title: "Start here" }], "bot");
}

function pageTrailer() {
  var names = [];
  document.querySelectorAll(".track-card h2, .track-code").forEach(function (node) {
    var text = node.textContent.replace(/\s+/g, " ").trim();
    if (text && names.length < 8) names.push(text);
  });
  var line = names.length
    ? "Ten-minute trailer. The tracks on this page are: " + names.join(". ") + ". Start with Control Hub, then Calling, then a contact-center track. Each room has a diagram, a worked example, and a quiz."
    : "Ten-minute trailer. This lab has eight written tracks: Control Hub, Webex Calling, multi-tenant contact center, Contact Center Enterprise, Dedicated Instance, migrations, SIP and queues, then flows and troubleshooting. Start at Control Hub. I do not add facts that are not in the rooms.";
  say(line, [{ href: "start.html", title: "Start here" }, { href: "index.html#rooms", title: "All rooms" }], "bot");
}

function submitText(text) {
  var value = String(text || "").trim();
  if (!value) return;
  hideNudge(false);
  if (/^read along$/i.test(value) || /read this page/i.test(value)) {
    say(value, [], "user");
    startAlong();
    return;
  }
  if (/1-minute clip/i.test(value)) {
    say(value, [], "user");
    pageClip();
    return;
  }
  if (/10-minute trailer/i.test(value)) {
    say(value, [], "user");
    pageTrailer();
    return;
  }
  if (/mute me and just read/i.test(value)) {
    say(value, [], "user");
    applyVoice(false);
    say("Voice stays off. Read the page. The Help room explains the menu, the course, and downloads.", [{ href: "help.html", title: "Help" }], "bot");
    return;
  }
  if (/1-hour guided walk/i.test(value)) value = "Start the 1-hour course";
  if (/teach me this room/i.test(value)) value = "Teach me this room";
  if (/interview practice/i.test(value)) {
    say(value, [], "user");
    say("Interview practice lives on the interview page. The answers there are generic study examples with citations. I do not invent anyone's work history.", [{ href: "interviews.html", title: "Interview prep" }], "bot");
    return;
  }
  say(value, [], "user");
  setPose("think");
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
    setPose("greet");
    say("Welcome to CypherMonkey Labs, I'm your Webex guide. I only repeat the notes in this lab.", [], "bot");
    var choices = [
      ["1-minute clip", "Give me the 1-minute clip"],
      ["10-minute trailer", "Play the 10-minute trailer"],
      ["1-hour guided walk", "Start the 1-hour guided walk"],
      ["Cheat codes", "Open cheat codes"],
      ["Quiz me", "Quiz me"],
      ["Teach me this room", "Teach me this room"],
      ["Interview practice", "Interview practice"],
      ["Games", "Play a game"],
      ["Read this page", "Read this page"],
      ["Mute me and just read", "Mute me and just read"]
    ];
    var row = document.createElement("div");
    row.className = "cg-choices";
    choices.forEach(function (choice) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "cg-choice";
      button.textContent = choice[0];
      button.addEventListener("click", function () {
        if (choice[0] === "Cheat codes") {
          location.href = abs("downloads.html");
          return;
        }
        if (choice[0] === "Games") {
          location.href = abs("play.html");
          return;
        }
        if (choice[0] === "Read this page") {
          startAlong();
          return;
        }
        submitText(choice[1]);
      });
      row.appendChild(button);
    });
    log.appendChild(row);
    scrollLog();
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

function voiceRank(voice) {
  var name = String(voice.name || "").toLowerCase();
  var lang = String(voice.lang || "").toLowerCase();
  var score = 0;
  if (lang.indexOf("en") === 0) score += 40;
  else score -= 30;
  if (/natural|neural|enhanced|premium|online/.test(name)) score += 55;
  if (/aria|jenny|guy|sonia|libby|ryan|sara|michelle|emma|brian|andrew|ava|serena/.test(name)) score += 36;
  if (/samantha|daniel|karen|moira|fiona|alex|victoria|allison/.test(name)) score += 16;
  if (/compact|espeak|zarvox|bad news|bells|boing/.test(name)) score -= 40;
  if (voice.localService === false) score += 10;
  return score;
}

function fillVoices() {
  if (!window.speechSynthesis) return;
  var voices = window.speechSynthesis.getVoices().slice().sort(function (a, b) { return voiceRank(b) - voiceRank(a); });
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
  voiceName.value = match ? current : voices[0].voiceURI;
  voicePref.uri = voiceName.value;
  if (!voicePref.rate) voicePref.rate = "0.92";
  if (!voicePref.pitch) voicePref.pitch = "0.95";
  saveVoice();
}

function splitSentences(text) {
  return String(text || "").replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(function (part) { return part.length > 0; });
}

function showSpoken(parts, index) {
  if (!spokenEl) return;
  spokenEl.hidden = false;
  spokenEl.innerHTML = parts.map(function (part, at) {
    return (at === index ? "<mark>" : "<span>") + part.replace(/[&<>]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch];
    }) + (at === index ? "</mark>" : "</span>");
  }).join(" ");
}

function chosenVoice() {
  var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  var chosen = null;
  voices.forEach(function (voice) {
    if (!chosen && voice.voiceURI === voicePref.uri) chosen = voice;
  });
  if (!chosen && voices.length) {
    voices = voices.slice().sort(function (a, b) { return voiceRank(b) - voiceRank(a); });
    chosen = voices[0];
  }
  return chosen;
}

function speak(text) {
  if (along.active) return;
  if (!voicePref.on || !window.speechSynthesis) return;
  var parts = splitSentences(text);
  if (!parts.length) return;
  window.speechSynthesis.cancel();
  var voice = chosenVoice();
  var rate = Number(voicePref.rate || (voiceRate && voiceRate.value) || 0.92);
  var pitch = Number(voicePref.pitch || (voicePitch && voicePitch.value) || 0.95);
  var index = 0;
  function next() {
    if (!voicePref.on || index >= parts.length) {
      if (spokenEl) spokenEl.hidden = true;
      setPose("idle");
      return;
    }
    showSpoken(parts, index);
    var utter = new SpeechSynthesisUtterance(parts[index]);
    utter.rate = rate > 0 ? rate : 0.92;
    utter.pitch = pitch > 0 ? pitch : 0.95;
    if (voice) utter.voice = voice;
    utter.onend = function () { index += 1; next(); };
    utter.onerror = function () { if (spokenEl) spokenEl.hidden = true; };
    window.speechSynthesis.speak(utter);
  }
  next();
}

function setupMic() {
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  micBtn.hidden = false;
  if (!Rec) {
    recognition = null;
    return;
  }
  recognition = new Rec();
  recognition.lang = document.documentElement.lang || "en-US";
  recognition.interimResults = true;
  recognition.onresult = function (event) {
    var said = "";
    for (var i = 0; i < event.results.length; i += 1) {
      said += event.results[i][0].transcript + " ";
    }
    said = said.trim();
    if (transcriptEl) transcriptEl.textContent = said;
    input.value = said;
    setPose("listen");
  };
  recognition.onend = function () {
    micBtn.setAttribute("aria-pressed", "false");
    if (talkStatus && !talk.hidden) talkStatus.textContent = "Stopped. Send the transcript or tap the mic again.";
  };
  recognition.onerror = function () {
    if (talkStatus) talkStatus.textContent = "The mic did not start. Type in the box instead.";
    if (talkFallback) talkFallback.hidden = false;
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
  document.querySelectorAll(".world-title, .world-lede, .world-kicker, .hero-copy, .hero-actions, main h1, main h2").forEach(function (el) {
    var rect = onScreen(el);
    if (rect) boxes.push(rect);
  });
  return boxes;
}

function dockBottom() {
  var saved = null;
  try {
    var data = JSON.parse(localStorage.getItem("cg-dock") || "null");
    if (data && typeof data.bottom === "number") saved = data.bottom;
  } catch (error) { saved = null; }
  var dock = 0;
  if (window.matchMedia("(max-width: 720px)").matches) {
    var bar = document.querySelector(".phone-dock");
    if (bar && getComputedStyle(bar).display !== "none") dock = Math.round(bar.getBoundingClientRect().height) || 84;
  }
  var bottom = saved == null ? Math.round(window.innerHeight * 0.34) : saved;
  if (bottom < dock + 12) bottom = dock + 12;
  var max = Math.max(dock + 12, window.innerHeight - 132);
  if (bottom > max) bottom = max;
  return bottom;
}

function syncMenuHide() {
  var away = document.body.classList.contains("edge-open") || document.body.classList.contains("phone-menu-open");
  host.classList.toggle("is-menu-away", away);
}

function place() {
  syncFont();
  syncMenuHide();
  if (host.dataset.dragging === "1") return;
  var boxes = obstacleBoxes();
  var story = contentBoxes();
  if (host.classList.contains("is-greeting")) {
    var greetW = 168;
    var greetH = 196;
    var greetRight = Math.max(8, Math.round((window.innerWidth - greetW) / 2));
    var greetBottom = Math.max(12, Math.round((window.innerHeight - greetH) / 2));
    host.style.setProperty("--cg-right", greetRight + "px");
    host.style.setProperty("--cg-bottom", greetBottom + "px");
    host.style.setProperty("--cg-nudge-right", Math.max(8, greetRight - 20) + "px");
    host.style.setProperty("--cg-nudge-bottom", (greetBottom + greetH + 8) + "px");
    return;
  }
  var width = 132;
  var height = 156;
  var needSlot = !panel.hidden || !nudge.hidden;
  var right = 8;
  var bottom = dockBottom();
  var monkeyBox = boxAt(right, bottom, width, height);
  var chosen = { right: right, bottom: bottom, slot: needSlot ? findSlot(monkeyBox, boxes.concat(story)) : null };
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

function hideNudge() {
  nudge.hidden = true;
  nudge.className = "cg-nudge";
}

function pokeStopped() {
  try { return localStorage.getItem("cg-poke-off") === "1"; } catch (error) { return true; }
}

function pokeCount() {
  try { return Number(localStorage.getItem("cg-poke-count") || "0") || 0; } catch (error) { return 3; }
}

function showPoke() {
  if (pokeStopped() || pokeCount() >= 3) return;
  if (!panel.hidden || !tourLayer.hidden || document.body.classList.contains("onboard-open") || host.classList.contains("is-greeting") || host.classList.contains("is-menu-away")) {
    window.setTimeout(showPoke, 20000);
    return;
  }
  try { localStorage.setItem("cg-poke-count", String(pokeCount() + 1)); } catch (error) { return; }
  nudge.innerHTML = "";
  nudge.className = "cg-nudge cg-poke";
  var copy = document.createElement("p");
  copy.textContent = "I can read this page with you, or stay quiet.";
  var actions = document.createElement("div");
  actions.className = "cg-nudge-actions";
  function add(label, fn) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", fn);
    actions.appendChild(button);
  }
  add("Read this page", function () {
    hideNudge();
    startAlong();
  });
  add("Not now", function () {
    hideNudge();
    if (pokeCount() < 3 && !pokeStopped()) window.setTimeout(showPoke, 180000);
  });
  add("Stop offering", function () {
    try { localStorage.setItem("cg-poke-off", "1"); } catch (error) { /* storage off */ }
    hideNudge();
  });
  nudge.appendChild(copy);
  nudge.appendChild(actions);
  nudge.hidden = false;
  place();
}

function scheduleNudge() {
  if (pokeStopped() || pokeCount() >= 3) return;
  window.setTimeout(showPoke, 150000);
}

function beginGreet() {
  try {
    if (localStorage.getItem("cg-greet-done") === "1") return;
    localStorage.setItem("cg-greet-done", "1");
  } catch (error) { return; }
  var closed = false;
  host.classList.add("is-greeting");
  setPose("greet");
  nudge.innerHTML = "";
  nudge.className = "cg-nudge cg-greet";
  var copy = document.createElement("p");
  copy.textContent = "Welcome to CypherMonkey Labs, I'm your Webex guide. I only repeat the notes in this lab.";
  var actions = document.createElement("div");
  actions.className = "cg-nudge-actions";
  var hear = document.createElement("button");
  hear.type = "button";
  hear.textContent = "Hear it";
  var dock = document.createElement("button");
  dock.type = "button";
  dock.textContent = "Dock on the right";
  hear.addEventListener("click", function () {
    if (!window.speechSynthesis) {
      copy.textContent = "This browser has no speech synthesis. The words stay on screen.";
      return;
    }
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance("Welcome to CypherMonkey Labs, I'm your Webex guide. I only repeat the notes in this lab.");
    utter.rate = 0.92;
    utter.pitch = 0.95;
    var voice = chosenVoice();
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
  });
  function finish() {
    if (closed) return;
    closed = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    host.classList.remove("is-greeting");
    hideNudge();
    setPose("idle");
    place();
  }
  dock.addEventListener("click", finish);
  actions.appendChild(hear);
  actions.appendChild(dock);
  nudge.appendChild(copy);
  nudge.appendChild(actions);
  nudge.hidden = false;
  place();
  window.setTimeout(finish, 8000);
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

function sectionBits(section) {
  var bits = [];
  section.querySelectorAll("h1, h2, h3, p, li, dd, figcaption").forEach(function (node) {
    if (node.closest("svg, .export-bar, .studio-ideas")) return;
    var text = node.textContent.replace(/\s+/g, " ").trim();
    if (text) bits.push(text);
  });
  return bits.join(" ");
}

function collectSections() {
  var list = [];
  document.querySelectorAll("main section[id]").forEach(function (section) {
    if (section.closest(".cg-root")) return;
    var heading = section.querySelector("h1, h2, h3");
    var title = heading ? heading.textContent.replace(/\s+/g, " ").trim() : section.id;
    var sentences = splitSentences(sectionBits(section));
    if (!sentences.length) return;
    list.push({ id: section.id, title: title, el: section, sentences: sentences });
  });
  return list;
}

function clearSpokenMark() {
  if (window.CSS && CSS.highlights) CSS.highlights.delete("spoken");
  document.querySelectorAll(".is-read-along").forEach(function (el) { el.classList.remove("is-read-along"); });
  document.querySelectorAll(".toc a.is-reading, .cg-outline .is-reading").forEach(function (el) { el.classList.remove("is-reading"); });
}

function findRange(root, sentence) {
  var target = String(sentence || "").replace(/\s+/g, " ").trim();
  if (!target || target.length < 8) return null;
  var records = [];
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      if (!node.parentElement || node.parentElement.closest("svg, script, style, .export-bar")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var plain = "";
  while (walker.nextNode()) {
    var value = walker.currentNode.nodeValue.replace(/\s+/g, " ");
    records.push({ node: walker.currentNode, start: plain.length, value: value, raw: walker.currentNode.nodeValue });
    plain += value;
  }
  var at = plain.indexOf(target);
  var length = target.length;
  if (at < 0) {
    var snippet = target.slice(0, 48);
    at = plain.indexOf(snippet);
    length = snippet.length;
  }
  if (at < 0) return null;
  function point(index) {
    var i;
    for (i = 0; i < records.length; i += 1) {
      var rec = records[i];
      if (index <= rec.start + rec.value.length) {
        return { node: rec.node, offset: Math.max(0, Math.min(rec.raw.length, index - rec.start)) };
      }
    }
    var last = records[records.length - 1];
    return { node: last.node, offset: last.raw.length };
  }
  var range = document.createRange();
  var start = point(at);
  var end = point(at + length);
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  return range;
}

function markSentence(section, sentence) {
  if (!(window.CSS && CSS.highlights && window.Highlight)) return;
  try {
    var range = findRange(section.el, sentence);
    if (!range) return;
    CSS.highlights.set("spoken", new Highlight(range));
  } catch (error) { /* the outline still shows the sentence */ }
}

function markSection(section) {
  clearSpokenMark();
  section.el.classList.add("is-read-along");
  var link = document.querySelector('.toc a[href="#' + section.id + '"]');
  if (link) {
    link.classList.add("is-reading");
    try { link.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (error) { /* older browsers */ }
  }
  var reduce = document.documentElement.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { section.el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); } catch (error) { section.el.scrollIntoView(); }
}

function paintOutline() {
  var list = panel.querySelector("[data-outline]");
  if (!list) return;
  list.hidden = !along.sections.length;
  list.innerHTML = "";
  along.sections.forEach(function (section, index) {
    var item = document.createElement("li");
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = section.title;
    if (index === along.index) {
      button.className = "is-reading";
      item.className = "is-reading";
    }
    button.addEventListener("click", function () {
      along.active = true;
      along.paused = false;
      along.index = index;
      along.sentence = 0;
      alongToken += 1;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      speakSection();
    });
    item.appendChild(button);
    list.appendChild(item);
  });
}

function finishAlong() {
  along.active = false;
  along.paused = false;
  alongToken += 1;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  clearSpokenMark();
  if (spokenEl) spokenEl.hidden = true;
  setPose("idle");
}

function speakSentence() {
  if (!along.active || along.paused) return;
  var section = along.sections[along.index];
  if (!section) { finishAlong(); return; }
  if (along.sentence >= section.sentences.length) {
    along.index += 1;
    along.sentence = 0;
    speakSection();
    return;
  }
  var sentence = section.sentences[along.sentence];
  markSentence(section, sentence);
  showSpoken(section.sentences, along.sentence);
  setPose("listen");
  if (!window.speechSynthesis) return;
  var token = ++alongToken;
  window.speechSynthesis.cancel();
  var utter = new SpeechSynthesisUtterance(sentence);
  var voice = chosenVoice();
  utter.rate = Number(voicePref.rate || 0.92) || 0.92;
  utter.pitch = Number(voicePref.pitch || 0.95) || 0.95;
  if (voice) utter.voice = voice;
  utter.onend = function () {
    if (token !== alongToken || !along.active || along.paused) return;
    along.sentence += 1;
    speakSentence();
  };
  window.speechSynthesis.speak(utter);
}

function speakSection() {
  if (!along.active) return;
  var section = along.sections[along.index];
  if (!section) { finishAlong(); return; }
  markSection(section);
  paintOutline();
  speakSentence();
}

function startAlong(id) {
  along.sections = collectSections();
  if (!along.sections.length) {
    say("This page has no sections I can read aloud. Open a room.", [{ href: "index.html#rooms", title: "Rooms" }], "bot");
    return;
  }
  var start = 0;
  if (id) along.sections.forEach(function (section, index) { if (section.id === id) start = index; });
  along.active = true;
  along.paused = false;
  along.index = start;
  along.sentence = 0;
  if (panel.hidden) openPanel();
  paintOutline();
  var note = window.speechSynthesis
    ? "Reading this page aloud. Pause, Resume, and Next section are the buttons above the outline."
    : "This browser has no speech synthesis. The outline still follows the section. Use Next section.";
  say(note, [], "bot");
  speakSection();
}

function stopAmbience() {
  ambience.nodes.forEach(function (node) {
    try { node.stop && node.stop(); } catch (error) { /* already stopped */ }
    try { node.disconnect(); } catch (error) { /* already disconnected */ }
  });
  ambience.nodes = [];
}

function startAmbience(name) {
  stopAmbience();
  if (!name) return;
  var Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) {
    say("This browser cannot play a generated sound theme.", [], "bot");
    return;
  }
  if (!ambience.ctx) ambience.ctx = new Ctx();
  ambience.ctx.resume();
  var gain = ambience.ctx.createGain();
  gain.gain.value = 0.02;
  gain.connect(ambience.ctx.destination);
  ambience.nodes.push(gain);
  if (name === "pad") {
    [196, 247, 294].forEach(function (freq) {
      var osc = ambience.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start();
      ambience.nodes.push(osc);
    });
    return;
  }
  var length = ambience.ctx.sampleRate * 2;
  var buffer = ambience.ctx.createBuffer(1, length, ambience.ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  var noise = ambience.ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  var filter = ambience.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  noise.connect(filter);
  filter.connect(gain);
  noise.start();
  ambience.nodes.push(noise, filter);
}

function bind() {
  var drag = { id: null, moved: false, y: 0, bottom: 0 };
  monkey.addEventListener("pointerdown", function (event) {
    if (event.button != null && event.button !== 0) return;
    drag.id = event.pointerId;
    drag.moved = false;
    drag.y = event.clientY;
    drag.bottom = parseFloat(host.style.getPropertyValue("--cg-bottom")) || dockBottom();
    try { monkey.setPointerCapture(event.pointerId); } catch (error) { /* pointer capture is optional */ }
  });
  monkey.addEventListener("pointermove", function (event) {
    if (drag.id !== event.pointerId) return;
    if (!drag.moved && Math.abs(event.clientY - drag.y) < 8) return;
    drag.moved = true;
    host.dataset.dragging = "1";
    var next = drag.bottom + (drag.y - event.clientY);
    var floor = window.matchMedia("(max-width: 720px)").matches ? 96 : 12;
    var max = window.innerHeight - 132;
    if (next < floor) next = floor;
    if (next > max) next = max;
    host.style.setProperty("--cg-right", "8px");
    host.style.setProperty("--cg-bottom", Math.round(next) + "px");
  });
  function endDrag(event) {
    if (drag.id !== event.pointerId) return;
    drag.id = null;
    host.dataset.dragging = "0";
    if (!drag.moved) return;
    var bottom = parseFloat(host.style.getPropertyValue("--cg-bottom")) || dockBottom();
    try { localStorage.setItem("cg-dock", JSON.stringify({ bottom: bottom })); } catch (error) { /* storage off */ }
  }
  monkey.addEventListener("pointerup", endDrag);
  monkey.addEventListener("pointercancel", endDrag);
  monkey.addEventListener("click", function (event) {
    if (drag.moved) {
      drag.moved = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
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
  if (voicePitch) {
    voicePitch.value = voicePref.pitch || "0.95";
    voicePitch.addEventListener("change", function () {
      voicePref.pitch = voicePitch.value;
      saveVoice();
    });
  }
  panel.querySelector("[data-voice-pause]").addEventListener("click", function () {
    if (window.speechSynthesis) window.speechSynthesis.pause();
  });
  panel.querySelector("[data-voice-resume]").addEventListener("click", function () {
    if (window.speechSynthesis) window.speechSynthesis.resume();
  });
  panel.querySelector("[data-voice-stop]").addEventListener("click", function () {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (spokenEl) spokenEl.hidden = true;
    setPose("idle");
  });
  if (window.speechSynthesis) {
    fillVoices();
    window.speechSynthesis.addEventListener("voiceschanged", fillVoices);
    voiceRate.value = voicePref.rate || "0.92";
    applyVoice(voicePref.on);
  } else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Read aloud isn't available in this browser.";
  }
  setupMic();
  function openTalk() {
    talk.hidden = false;
    setPose("listen");
    if (!recognition) {
      talkFallback.hidden = false;
      talkStatus.textContent = "Voice input is not in this browser. Type below and send.";
      input.focus();
      return;
    }
    talkFallback.hidden = true;
    talkStatus.textContent = "Listening. Speak, then send the transcript.";
    try {
      micBtn.setAttribute("aria-pressed", "true");
      recognition.start();
    } catch (error) {
      talkStatus.textContent = "The mic is already on, or this page blocked it. You can still type.";
    }
  }
  micBtn.addEventListener("click", openTalk);
  panel.querySelector("[data-talk-close]").addEventListener("click", function () {
    talk.hidden = true;
    if (recognition) {
      try { recognition.stop(); } catch (error) { /* already stopped */ }
    }
    micBtn.setAttribute("aria-pressed", "false");
    setPose("idle");
  });
  panel.querySelector("[data-talk-send]").addEventListener("click", function () {
    var said = (transcriptEl.textContent || input.value || "").trim();
    if (!said) {
      talkStatus.textContent = "Nothing to send yet. Speak again or type in the box.";
      return;
    }
    talk.hidden = true;
    submitText(said);
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
  panel.querySelector("[data-along-start]").addEventListener("click", function () { startAlong(); });
  panel.querySelector("[data-along-pause]").addEventListener("click", function () {
    along.paused = true;
    if (window.speechSynthesis) window.speechSynthesis.pause();
    setPose("think");
  });
  panel.querySelector("[data-along-resume]").addEventListener("click", function () {
    if (!along.active) { startAlong(); return; }
    along.paused = false;
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPose("listen");
      return;
    }
    speakSentence();
  });
  panel.querySelector("[data-along-next]").addEventListener("click", function () {
    if (!along.active) { startAlong(); return; }
    along.paused = false;
    along.index += 1;
    along.sentence = 0;
    alongToken += 1;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speakSection();
  });
  panel.querySelector("[data-ambience]").addEventListener("change", function (event) {
    startAmbience(event.target.value);
  });
  document.addEventListener("canon-read-section", function (event) {
    var id = event.detail && event.detail.id;
    startAlong(id);
  });
  document.addEventListener("canon-tour-finished", function () { beginGreet(); });
  var menuWatch = new MutationObserver(syncMenuHide);
  menuWatch.observe(document.body, { attributes: true, attributeFilter: ["class"] });
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
    '<span class="cg-float" aria-hidden="true"><svg viewBox="0 0 120 140" role="img" aria-hidden="true">' +
    '<defs><radialGradient id="cgfur" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffe7a3"/><stop offset=".55" stop-color="#f6b73c"/><stop offset="1" stop-color="#b45309"/></radialGradient></defs>' +
    '<ellipse cx="60" cy="128" rx="28" ry="7" fill="#020617" opacity=".28"/>'
    '<g class="cg-wave"><path d="M96 78c18-6 22 10 12 22" fill="none" stroke="#e8a317" stroke-width="8" stroke-linecap="round"/>' +
    '<circle cx="108" cy="62" r="8" fill="#f6b73c"/></g>' +
    '<path d="M28 84c-16 8-14 22-2 26" fill="none" stroke="#e8a317" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M88 104c14 10 10 22-2 24" fill="none" stroke="#c2410c" stroke-width="7" stroke-linecap="round"/>' +
    '<rect x="40" y="78" width="40" height="36" rx="16" fill="#f6b73c"/>' +
    '<circle class="cg-ear" cx="26" cy="58" r="11" fill="#f6b73c"/><circle cx="26" cy="58" r="5" fill="#7c4a12"/>' +
    '<circle class="cg-ear" cx="94" cy="58" r="11" fill="#f6b73c"/><circle cx="94" cy="58" r="5" fill="#7c4a12"/>' +
    '<circle cx="60" cy="56" r="30" fill="url(#cgfur)"/>' +
    '<ellipse cx="60" cy="66" rx="16" ry="12" fill="#ffe7a3"/>' +
    '<g class="cg-eye"><ellipse cx="50" cy="54" rx="5" ry="6" fill="#fff"/><circle cx="51" cy="55" r="2.3" fill="#1c1917"/></g>' +
    '<g class="cg-eye"><ellipse cx="70" cy="54" rx="5" ry="6" fill="#fff"/><circle cx="71" cy="55" r="2.3" fill="#1c1917"/></g>' +
    '<circle cx="50" cy="54" r="7.2" fill="none" stroke="#fde047" stroke-width="1.7"/>' +
    '<circle cx="70" cy="54" r="7.2" fill="none" stroke="#fde047" stroke-width="1.7"/>' +
    '<path d="M46 50h28" fill="none" stroke="#fde047" stroke-width="1.7"/>' +
    '<path class="cg-mouth" d="M50 70c4 5 16 5 20 0" fill="none" stroke="#1c1917" stroke-width="2" stroke-linecap="round"/>' +
    '</svg></span><span class="cg-dock-name">Guide</span>';
}

function setPose(name) {
  host.dataset.pose = name || "idle";
}
