import { renderDiagram } from "./diagram.js";
import { mountFlow, stopFlow } from "./flow.js";
import { loadVoices, chooseVoice, voiceScore, speak, stopSpeech, playTone } from "./audio.js";

let releaseStudio = () => {};
let releaseTopology = () => {};

const SETTINGS_KEY = "webexlab.settings";
const PROGRESS_KEY = "webexlab.progress";

const state = {
  catalog: null,
  tracks: new Map(),
  search: [],
  bosses: [],
  interview: [],
  glossary: [],
  certs: null,
  sources: [],
  voices: [],
};

const settings = loadSettings();
applySettings(settings);

init();

async function init() {
  bindChrome();
  window.addEventListener("hashchange", () => { void render(); });
  try {
    const [catalog, search, bosses, interview, glossary, certs, sources] = await Promise.all([
      getJSON("data/catalog.json"),
      getJSON("data/search.json"),
      getJSON("data/bosses.json"),
      getJSON("data/interview.json"),
      getJSON("data/glossary.json"),
      getJSON("data/certs.json"),
      getJSON("data/sources.json"),
    ]);
    state.catalog = catalog;
    state.search = search;
    state.bosses = bosses;
    state.interview = interview;
    state.glossary = glossary;
    state.certs = certs;
    state.sources = sources;
    paintRail();
  } catch (error) {
    document.getElementById("view-title").textContent = "Catalog unavailable";
    document.getElementById("view-body").append(errorBlock(error));
    return;
  }
  state.voices = await loadVoices();
  fillVoices();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  await render();
}

function bindChrome() {
  document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const q = new FormData(event.target).get("q");
    location.hash = `#/search/${encodeURIComponent(String(q || "").trim())}`;
  });
  document.getElementById("open-settings").addEventListener("click", openSettings);
  document.getElementById("close-settings").addEventListener("click", closeSettings);
  document.getElementById("save-offline").addEventListener("click", saveOffline);
  document.getElementById("settings-form").addEventListener("change", onSettingsChange);
  document.getElementById("settings-form").addEventListener("input", onSettingsChange);
}

function onSettingsChange() {
  const form = document.getElementById("settings-form");
  const data = Object.fromEntries(new FormData(form).entries());
  const next = {
    theme: data.theme || "orbit",
    sound: data.sound === "on",
    narration: data.narration === "on",
    voiceURI: data.voiceURI || "",
    rate: Number(data.rate) || 1,
    motion: data.motion || "system",
    font: Number(data.font) || 18,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  applySettings(next);
  Object.assign(settings, next);
}

function loadSettings() {
  const base = {
    theme: window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "lumen" : "orbit",
    sound: true,
    narration: false,
    voiceURI: "",
    rate: 1,
    motion: "system",
    font: 18,
  };
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return base;
  }
}

function applySettings(value) {
  document.documentElement.dataset.theme = value.theme || "orbit";
  document.documentElement.dataset.motion = value.motion || "system";
  document.documentElement.style.setProperty("--cc-font", `${value.font || 18}px`);
}

function fillVoices() {
  const select = document.getElementById("voice-picker");
  select.replaceChildren();
  const ranked = [...state.voices].sort((a, b) => voiceScore(b) - voiceScore(a));
  const usable = ranked.filter((voice) => voiceScore(voice) >= 0);
  const list = usable.length ? usable : ranked;
  if (!settings.voiceURI) {
    const picked = chooseVoice(list, "");
    if (picked) settings.voiceURI = picked.voiceURI;
  }
  for (const voice of list) {
    const opt = document.createElement("option");
    opt.value = voice.voiceURI;
    opt.textContent = `${voice.name} (${voice.lang})`;
    if (voice.voiceURI === settings.voiceURI) opt.selected = true;
    select.append(opt);
  }
  if (!list.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No speech voices in this browser";
    select.append(opt);
  }
  syncSettingsForm();
}

function syncSettingsForm() {
  const form = document.getElementById("settings-form");
  form.elements.theme.value = settings.theme;
  form.elements.sound.value = settings.sound === false ? "off" : "on";
  form.elements.narration.value = settings.narration ? "on" : "off";
  form.elements.rate.value = String(settings.rate || 1);
  form.elements.motion.value = settings.motion || "system";
  form.elements.font.value = String(settings.font || 18);
  if (settings.voiceURI) form.elements.voiceURI.value = settings.voiceURI;
}

function openSettings() {
  syncSettingsForm();
  document.getElementById("settings-dialog").hidden = false;
  document.getElementById("close-settings").focus();
}

function closeSettings() {
  document.getElementById("settings-dialog").hidden = true;
}

async function saveOffline() {
  const status = document.getElementById("offline-status");
  status.textContent = "Saving tracks for offline use.";
  const reg = await navigator.serviceWorker?.ready;
  if (!reg) {
    status.textContent = "Service workers are unavailable in this browser context.";
    return;
  }
  const urls = state.catalog.tracks.map((track) => `data/tracks/${track.id}.json`);
  for (const url of urls) await getJSON(url);
  const cache = await caches.open("webex-lab-v1");
  await cache.addAll(urls.map((url) => new URL(url, location.href).toString()));
  status.textContent = `Saved ${urls.length} tracks. Reload once without a network to confirm.`;
}

function paintRail() {
  const nav = document.getElementById("rail-tracks");
  nav.replaceChildren();
  for (const track of state.catalog.tracks) {
    const a = document.createElement("a");
    a.href = `#/track/${track.id}`;
    a.textContent = track.title;
    const dot = document.createElement("span");
    dot.className = "progress-dot";
    if (trackDone(track) === track.lessons.length) dot.classList.add("done");
    a.append(dot);
    nav.append(a);
  }
}

async function render() {
  stopFlow();
  releaseStudio();
  releaseStudio = () => {};
  releaseTopology();
  releaseTopology = () => {};
  stopSpeech();
  const parts = routeParts();
  const h1 = document.getElementById("view-title");
  const body = document.getElementById("view-body");
  body.replaceChildren();
  const head = parts[0] || "home";
  try {
    if (head === "home") renderHome(h1, body);
    else if (head === "tracks") renderTracks(h1, body);
    else if (head === "track") await renderTrack(h1, body, parts[1]);
    else if (head === "lesson") await renderLesson(h1, body, parts[1], parts[2]);
    else if (head === "studio") await renderStudio(h1, body, parts[1]);
    else if (head === "topology") await renderTopology(h1, body);
    else if (head === "boss") renderBoss(h1, body, parts[1]);
    else if (head === "interview") renderInterview(h1, body);
    else if (head === "glossary") renderGlossary(h1, body);
    else if (head === "mind") renderMind(h1, body);
    else if (head === "sources") renderSources(h1, body);
    else if (head === "certs") renderCerts(h1, body);
    else if (head === "search") renderSearch(h1, body, decodeURIComponent(parts[1] || ""));
    else renderMissing(h1, body);
  } catch (error) {
    h1.textContent = "This view did not load";
    body.append(errorBlock(error));
  }
  markCurrent(head);
  h1.tabIndex = -1;
  h1.focus();
}

function renderHome(h1, body) {
  h1.textContent = "Webex Lab";
  const lede = document.createElement("p");
  lede.className = "lede";
  lede.textContent = "A practice console for Control Hub, Webex Calling, Dedicated Instance, Webex Contact Center, devices, and the move away from Unified CM, UCCX, and UCCE. Lessons cite Cisco, IETF, ITU, or FCC pages.";
  body.append(lede);
  const counts = countCatalog();
  const stats = document.createElement("div");
  stats.className = "stat-row";
  for (const [label, value] of [
    ["Tracks", counts.tracks],
    ["Lessons", counts.lessons],
    ["Quiz questions", counts.quiz],
    ["Labs", counts.labs],
    ["Faults", counts.faults],
  ]) {
    const card = document.createElement("div");
    card.className = "card stat";
    const strong = document.createElement("strong");
    strong.textContent = String(value);
    const span = document.createElement("span");
    span.textContent = label;
    card.append(strong, span);
    stats.append(card);
  }
  body.append(stats);
  const grid = document.createElement("div");
  grid.className = "card-grid";
  grid.append(
    linkCard("Start with foundations", "Platform map, SIP, E.164, ports, and licenses.", "#/track/t01"),
    linkCard("Flow designer", "Queue Contact, Virtual Agent V2, HTTP data dips.", "#/studio/flow"),
    linkCard("Dial-plan simulator", "Routing prefixes, patterns, and the cloud PSTN limit.", "#/studio/dial"),
    linkCard("Control Hub walkthrough", "Eleven documented paths, one practice console.", "#/studio/hub"),
    linkCard("3D topology", "Orbit Calling, Dedicated Instance, RedSky, and the contact center.", "#/topology"),
    linkCard("Boss incidents", "Synthetic logs. The fix is still the documented one.", "#/boss"),
    linkCard("Glossary", "Queues, trunks, HELD, and the other nouns that collide.", "#/glossary"),
    linkCard("Mind map", "Control Hub in the middle, with a link on every node.", "#/mind"),
    linkCard("Interview desk", "Short answers you can say, each one with a source.", "#/interview"),
    linkCard("Certifications", "300-830 CLCCE, CCNP Collaboration, and the course that is not the exam.", "#/certs"),
    linkCard("Sources", "Every article this lab is willing to cite.", "#/sources"),
  );
  body.append(grid);
  const h2 = document.createElement("h2");
  h2.textContent = "Tracks";
  body.append(h2, trackGrid());
}

function renderTracks(h1, body) {
  h1.textContent = "Tracks";
  const p = document.createElement("p");
  p.className = "lede";
  p.textContent = "Sixteen tracks, loaded one at a time. Finish a lesson to mark it on this device.";
  body.append(p, trackGrid());
}

function trackGrid() {
  const grid = document.createElement("div");
  grid.className = "card-grid";
  for (const track of state.catalog.tracks) {
    const done = trackDone(track);
    const a = document.createElement("a");
    a.className = "card";
    a.href = `#/track/${track.id}`;
    const k = document.createElement("p");
    k.className = "kicker";
    k.textContent = track.level;
    const h = document.createElement("h2");
    h.textContent = track.title;
    const p = document.createElement("p");
    p.textContent = track.blurb;
    const s = document.createElement("p");
    s.textContent = `${done} of ${track.lessons.length} lessons marked`;
    a.append(k, h, p, s);
    grid.append(a);
  }
  return grid;
}

async function renderTrack(h1, body, id) {
  const meta = state.catalog.tracks.find((track) => track.id === id);
  if (!meta) return renderMissing(h1, body);
  const track = await loadTrack(id);
  h1.textContent = track.title;
  const p = document.createElement("p");
  p.className = "lede";
  p.textContent = track.blurb;
  body.append(p);
  const list = document.createElement("ol");
  list.className = "stack";
  track.lessons.forEach((lesson, index) => {
    const item = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#/lesson/${track.id}/${lesson.id}`;
    a.textContent = lesson.title;
    const small = document.createElement("span");
    small.textContent = ` · ${lesson.level} · ${lesson.minutes} min`;
    if (isDone(track.id, lesson.id)) a.append(document.createTextNode(" · done"));
    item.append(a, small);
    if (index === 0) item.prepend(document.createTextNode(""));
    list.append(item);
  });
  body.append(list);
}

async function renderLesson(h1, body, trackId, lessonId) {
  const track = await loadTrack(trackId);
  const lesson = track?.lessons.find((row) => row.id === lessonId);
  if (!lesson) return renderMissing(h1, body);
  h1.textContent = lesson.title;
  const k = document.createElement("p");
  k.className = "kicker";
  k.textContent = `${track.title} · ${lesson.level} · ${lesson.minutes} min`;
  const summary = document.createElement("p");
  summary.className = "lede";
  summary.textContent = lesson.summary;
  body.append(k, summary);
  if (lesson.uncertainty) body.append(callout(lesson.uncertainty, "warn"));
  body.append(renderDiagram(lesson.diagram, motionReduced()));
  const flowHost = document.createElement("div");
  body.append(flowHost);
  mountFlow(flowHost, lesson.flow, {
    reduceMotion: motionReduced(),
    onStep: (step) => {
      playTone("step");
      if (settings.narration) speak(`${step.label}. ${step.detail}`);
    },
  });
  for (const section of lesson.sections) {
    const block = document.createElement("section");
    block.className = "lesson-block";
    const h = document.createElement("h2");
    h.textContent = section.h;
    block.append(h);
    for (const paragraph of section.paragraphs) {
      const p = document.createElement("p");
      p.textContent = paragraph;
      block.append(p);
    }
    if (section.cite) block.append(citeLink(section.cite));
    body.append(block);
  }
  body.append(renderQuiz(track.id, lesson), renderCards(lesson), renderLab(track.id, lesson), renderFault(lesson));
  const nav = document.createElement("p");
  const index = track.lessons.findIndex((row) => row.id === lesson.id);
  if (index > 0) nav.append(textLink(`#/lesson/${track.id}/${track.lessons[index - 1].id}`, "Previous lesson"), document.createTextNode(" · "));
  nav.append(textLink(`#/track/${track.id}`, "Track list"));
  if (index < track.lessons.length - 1) nav.append(document.createTextNode(" · "), textLink(`#/lesson/${track.id}/${track.lessons[index + 1].id}`, "Next lesson"));
  body.append(nav);
  if (settings.narration) speak(lesson.summary);
}

function renderQuiz(trackId, lesson) {
  const section = document.createElement("section");
  section.className = "lesson-block";
  const h = document.createElement("h2");
  h.textContent = "Quiz";
  section.append(h);
  const form = document.createElement("form");
  form.className = "stack";
  lesson.quiz.forEach((item, index) => {
    const field = document.createElement("fieldset");
    field.className = "choices";
    const legend = document.createElement("legend");
    legend.textContent = `${index + 1}. ${item.q}`;
    field.append(legend);
    const options = item.choices.map((choice, choiceIndex) => ({ choice, choiceIndex }));
    shuffle(options);
    for (const option of options) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${index}`;
      input.value = String(option.choiceIndex);
      input.required = true;
      label.append(input, document.createTextNode(option.choice));
      field.append(label);
    }
    form.append(field);
  });
  const submit = document.createElement("button");
  submit.className = "btn primary";
  submit.type = "submit";
  submit.textContent = "Check answers";
  const live = document.createElement("p");
  live.setAttribute("aria-live", "polite");
  const notesHost = document.createElement("div");
  form.append(submit, live, notesHost);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    let score = 0;
    const notes = [];
    lesson.quiz.forEach((item, index) => {
      const picked = Number(data.get(`q${index}`));
      if (picked === item.answer) score += 1;
      else notes.push(`${index + 1}. ${item.why}`);
    });
    live.textContent = `${score} of ${lesson.quiz.length} correct.`;
    playTone(score === lesson.quiz.length ? "ok" : "bad");
    notesHost.replaceChildren();
    if (notes.length) {
      const list = document.createElement("ul");
      for (const note of notes) {
        const li = document.createElement("li");
        li.textContent = note;
        list.append(li);
      }
      notesHost.append(list);
    }
    const prog = readProgress();
    prog.lessons = prog.lessons || {};
    const key = `${trackId}/${lesson.id}`;
    prog.lessons[key] = { ...(prog.lessons[key] || {}), quiz: score, done: score >= Math.ceil(lesson.quiz.length * 0.6) };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
    paintRail();
  });
  section.append(form);
  return section;
}

function renderCards(lesson) {
  const section = document.createElement("section");
  section.className = "lesson-block";
  const h = document.createElement("h2");
  h.textContent = "Flashcards";
  const face = document.createElement("div");
  face.className = "card card-face";
  let index = 0;
  let back = false;
  function paint() {
    const card = lesson.cards[index];
    face.textContent = back ? card.back : card.front;
    face.setAttribute("aria-label", back ? "Answer" : "Prompt");
  }
  const flip = document.createElement("button");
  flip.type = "button";
  flip.className = "btn";
  flip.textContent = "Flip";
  flip.addEventListener("click", () => { back = !back; paint(); });
  const next = document.createElement("button");
  next.type = "button";
  next.className = "btn";
  next.textContent = "Next card";
  next.addEventListener("click", () => {
    index = (index + 1) % lesson.cards.length;
    back = false;
    paint();
  });
  const row = document.createElement("div");
  row.className = "chip-row";
  row.append(flip, next);
  paint();
  section.append(h, face, row);
  return section;
}

function renderLab(trackId, lesson) {
  const section = document.createElement("section");
  section.className = "lesson-block";
  const h = document.createElement("h2");
  h.textContent = lesson.lab.title;
  const goal = document.createElement("p");
  goal.textContent = lesson.lab.goal;
  section.append(h, goal);
  const list = document.createElement("ol");
  lesson.lab.steps.forEach((step) => {
    const item = document.createElement("li");
    const label = document.createElement("label");
    label.className = "check";
    const input = document.createElement("input");
    input.type = "checkbox";
    const span = document.createElement("span");
    span.textContent = `${step.do} Expect: ${step.expect}`;
    label.append(input, span);
    item.append(label);
    list.append(item);
  });
  const done = document.createElement("button");
  done.type = "button";
  done.className = "btn primary";
  done.textContent = "Mark lab complete";
  const live = document.createElement("p");
  live.setAttribute("aria-live", "polite");
  done.addEventListener("click", () => {
    const boxes = [...list.querySelectorAll("input")];
    if (boxes.some((box) => !box.checked)) {
      live.textContent = "Check each step before you mark the lab.";
      playTone("bad");
      return;
    }
    const prog = readProgress();
    prog.lessons = prog.lessons || {};
    const key = `${trackId}/${lesson.id}`;
    prog.lessons[key] = { ...(prog.lessons[key] || {}), lab: true, done: true };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
    live.textContent = lesson.lab.check;
    playTone("ok");
    paintRail();
  });
  section.append(list, done, live);
  return section;
}

function renderFault(lesson) {
  const fault = lesson.fault;
  const section = document.createElement("section");
  section.className = "lesson-block";
  const h = document.createElement("h2");
  h.textContent = `Fault: ${fault.title}`;
  const symptom = document.createElement("p");
  symptom.textContent = fault.symptom;
  const log = document.createElement("pre");
  log.className = "log";
  log.textContent = `SYNTHETIC LOG\n${fault.log}`;
  const guess = document.createElement("label");
  guess.textContent = "Your hypothesis";
  const area = document.createElement("textarea");
  area.required = false;
  guess.append(area);
  const reveal = document.createElement("button");
  reveal.type = "button";
  reveal.className = "btn";
  reveal.textContent = "Reveal cause and fix";
  const answer = document.createElement("div");
  answer.hidden = true;
  reveal.addEventListener("click", () => {
    answer.hidden = false;
    answer.replaceChildren();
    answer.append(paragraph(`Cause: ${fault.cause}`), paragraph(`Fix: ${fault.fix}`));
    if (fault.cite) answer.append(citeLink(fault.cite));
  });
  section.append(h, symptom, log, guess, reveal, answer);
  return section;
}

async function renderStudio(h1, body, which) {
  const studio = await import("./studio.js");
  releaseStudio = () => studio.destroyStudio();
  if (which === "flow") {
    h1.textContent = "Flow designer";
    studio.mountDesigner(body, motionReduced());
  } else if (which === "dial") {
    h1.textContent = "Dial-plan simulator";
    studio.mountDial(body);
  } else if (which === "hub") {
    h1.textContent = "Control Hub walkthrough";
    studio.mountHub(body);
  } else {
    h1.textContent = "Studio";
    studio.mountStudioHome(body);
  }
}

async function renderTopology(h1, body) {
  h1.textContent = "Topology";
  const p = document.createElement("p");
  p.className = "lede";
  p.textContent = "Orbit the map. Toggles break the documented paths: certificate trunk, registration trunk, HELD, Dedicated Instance interop, cloud PSTN, optimized media, Expressway, and the contact center voice path.";
  body.append(p);
  const host = document.createElement("div");
  body.append(host);
  const topo = await import("./topology.js");
  releaseTopology = () => topo.destroyTopology();
  topo.mountTopology(host, motionReduced());
}

function renderBoss(h1, body, id) {
  if (!id) {
    h1.textContent = "Boss incidents";
    const p = document.createElement("p");
    p.className = "lede";
    p.textContent = "Eight incidents. The logs are synthetic. The underlying failure is a behavior Cisco documents.";
    const grid = document.createElement("div");
    grid.className = "card-grid";
    for (const boss of state.bosses) grid.append(linkCard(boss.title, boss.brief, `#/boss/${boss.id}`));
    body.append(p, grid);
    return;
  }
  const boss = state.bosses.find((row) => row.id === id);
  if (!boss) return renderMissing(h1, body);
  h1.textContent = boss.title;
  body.append(paragraph(boss.brief), callout("Logs below are synthetic. They are not from a customer system.", "warn"));
  const pre = document.createElement("pre");
  pre.className = "log";
  pre.textContent = boss.log;
  body.append(pre);
  const form = document.createElement("form");
  form.className = "stack";
  boss.checks.forEach((check, index) => {
    const field = document.createElement("fieldset");
    field.className = "choices";
    const legend = document.createElement("legend");
    legend.textContent = check.q;
    field.append(legend);
    check.choices.forEach((choice, choiceIndex) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `c${index}`;
      input.value = String(choiceIndex);
      input.required = true;
      label.append(input, document.createTextNode(choice));
      field.append(label);
    });
    form.append(field);
  });
  const button = document.createElement("button");
  button.className = "btn primary";
  button.textContent = "Check the incident";
  const live = document.createElement("div");
  live.setAttribute("aria-live", "polite");
  form.append(button);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    let score = 0;
    boss.checks.forEach((check, index) => {
      if (Number(data.get(`c${index}`)) === check.answer) score += 1;
    });
    live.replaceChildren(paragraph(`${score} of ${boss.checks.length}. ${boss.fix}`), citeLink(boss.cite));
    playTone(score === boss.checks.length ? "ok" : "bad");
  });
  body.append(form, live);
}

function renderInterview(h1, body) {
  h1.textContent = "Interview desk";
  const p = document.createElement("p");
  p.className = "lede";
  p.textContent = "Short answers you can say out loud. Each one points at a source. Flip a card, then open the citation before you treat the wording as current.";
  body.append(p);
  let index = 0;
  let show = false;
  const face = document.createElement("div");
  face.className = "card card-face";
  const live = document.createElement("p");
  function paint() {
    const item = state.interview[index];
    face.textContent = show ? item.a : item.q;
    live.textContent = `Question ${index + 1} of ${state.interview.length}`;
  }
  const row = document.createElement("div");
  row.className = "chip-row";
  const flip = document.createElement("button");
  flip.className = "btn";
  flip.type = "button";
  flip.textContent = "Show answer";
  flip.addEventListener("click", () => { show = !show; paint(); });
  const next = document.createElement("button");
  next.className = "btn";
  next.type = "button";
  next.textContent = "Next";
  next.addEventListener("click", () => { index = (index + 1) % state.interview.length; show = false; paint(); });
  const link = document.createElement("a");
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Source";
  const refresh = () => { link.href = state.interview[index].cite; };
  flip.addEventListener("click", refresh);
  next.addEventListener("click", refresh);
  row.append(flip, next, link);
  paint();
  refresh();
  body.append(face, live, row);
}

function renderGlossary(h1, body) {
  h1.textContent = "Glossary";
  const list = document.createElement("dl");
  list.className = "stack";
  for (const term of state.glossary) {
    const wrap = document.createElement("div");
    wrap.className = "lesson-block";
    const dt = document.createElement("dt");
    const strong = document.createElement("h2");
    strong.textContent = term.term;
    dt.append(strong);
    const dd = document.createElement("dd");
    dd.textContent = term.def;
    wrap.append(dt, dd, citeLink({ url: term.cite, label: "Source" }));
    list.append(wrap);
  }
  body.append(list);
}

function renderMind(h1, body) {
  h1.textContent = "Ecosystem mind map";
  const p = document.createElement("p");
  p.className = "lede";
  p.textContent = "Control Hub sits in the middle. Calling, Dedicated Instance, Contact Center, devices, and the migration sources hang off it. Select a node to open the track.";
  body.append(p);
  const links = [
    ["hub", "calling"], ["hub", "di"], ["hub", "wxcc"], ["hub", "devices"],
    ["calling", "pstn"], ["calling", "e911"], ["wxcc", "wfo"], ["wxcc", "ai"],
    ["cucm", "calling"], ["uccx", "wxcc"],
  ];
  const nodes = [
    ["hub", "Control Hub", 300, 40, "#/track/t02"],
    ["calling", "Webex Calling", 80, 150, "#/track/t04"],
    ["di", "Dedicated Instance", 520, 150, "#/track/t09"],
    ["wxcc", "Contact Center", 300, 180, "#/track/t10"],
    ["devices", "Devices", 300, 300, "#/track/t14"],
    ["pstn", "PSTN", 40, 280, "#/track/t05"],
    ["e911", "E911", 160, 300, "#/track/t08"],
    ["wfo", "WFO", 460, 280, "#/track/t12"],
    ["ai", "AI Agent", 560, 300, "#/track/t12"],
    ["cucm", "Unified CM", 40, 40, "#/track/t15"],
    ["uccx", "UCCX / UCCE", 520, 40, "#/track/t15"],
  ];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 700 380");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Mind map of the Webex lab ecosystem");
  svg.classList.add("diagram");
  const pos = Object.fromEntries(nodes.map((node) => [node[0], node]));
  for (const [a, b] of links) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", pos[a][2] + 60);
    line.setAttribute("y1", pos[a][3] + 16);
    line.setAttribute("x2", pos[b][2] + 60);
    line.setAttribute("y2", pos[b][3] + 16);
    line.setAttribute("class", "diagram-edge");
    svg.append(line);
  }
  body.append(svg);
  const grid = document.createElement("div");
  grid.className = "card-grid";
  for (const node of nodes) grid.append(linkCard(node[1], "Open the related track", node[4]));
  body.append(grid);
}

function renderSources(h1, body) {
  h1.textContent = "Sources";
  const p = document.createElement("p");
  p.className = "lede";
  p.textContent = "Every lesson links here or to the page named on the section. If a product name moved, trust the live page over this lab.";
  const list = document.createElement("ul");
  for (const source of state.sources) {
    const item = document.createElement("li");
    const a = document.createElement("a");
    a.href = source.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = source.label || source.url;
    item.append(a);
    list.append(item);
  }
  body.append(p, list);
}

function renderCerts(h1, body) {
  h1.textContent = "Certifications and courses";
  body.append(paragraph(state.certs.asOf));
  for (const item of state.certs.items) {
    const block = document.createElement("section");
    block.className = "lesson-block";
    const h = document.createElement("h2");
    h.textContent = item.name;
    const p = document.createElement("p");
    p.textContent = item.status;
    block.append(h, p);
    if (item.firstTest) block.append(paragraph(item.firstTest));
    block.append(citeLink({ url: item.url, label: "Official page" }));
    if (item.also) block.append(citeLink({ url: item.also, label: "Related Cisco page" }));
    body.append(block);
  }
}

function renderSearch(h1, body, query) {
  h1.textContent = query ? `Search: ${query}` : "Search";
  const q = query.toLowerCase();
  const hits = state.search.filter((row) => `${row.title} ${row.summary} ${row.keywords || ""}`.toLowerCase().includes(q));
  const p = document.createElement("p");
  p.textContent = q ? `${hits.length} lessons` : "Type a query in the top bar.";
  const list = document.createElement("div");
  list.className = "stack";
  for (const hit of hits.slice(0, 40)) list.append(linkCard(hit.title, `${hit.trackTitle}. ${hit.summary}`, `#/lesson/${hit.trackId}/${hit.lessonId}`));
  body.append(p, list);
}

function renderMissing(h1, body) {
  h1.textContent = "That page is not in the lab";
  const p = document.createElement("p");
  p.textContent = "The address does not match a track, lesson, or tool.";
  body.append(p, textLink("#/", "Back to the start"));
}

function linkCard(title, text, href) {
  const a = document.createElement("a");
  a.className = "card";
  a.href = href;
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = text;
  a.append(h, p);
  return a;
}

function paragraph(text) {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}

function callout(text, kind) {
  const p = document.createElement("p");
  p.className = `callout ${kind || ""}`;
  p.textContent = text;
  return p;
}

function citeLink(cite) {
  const p = document.createElement("p");
  const a = document.createElement("a");
  a.href = cite.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = cite.label || cite.url;
  p.append(a);
  return p;
}

function textLink(href, label) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = label;
  return a;
}

function errorBlock(error) {
  const p = document.createElement("p");
  p.className = "callout bad";
  p.textContent = error instanceof Error ? error.message : "Unknown error";
  return p;
}

function routeParts() {
  const raw = (location.hash || "#/").replace(/^#/, "");
  const path = raw.split("?")[0];
  return path.split("/").filter(Boolean);
}

function markCurrent(head) {
  const map = { home: "#/", tracks: "#/tracks", studio: "#/studio", topology: "#/topology" };
  for (const link of document.querySelectorAll(".rail a, .bottom-nav a")) {
    const href = link.getAttribute("href");
    const on = href === (map[head] || "");
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

async function loadTrack(id) {
  if (state.tracks.has(id)) return state.tracks.get(id);
  const track = await getJSON(`data/tracks/${id}.json`);
  state.tracks.set(id, track);
  return track;
}

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return response.json();
}

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function isDone(trackId, lessonId) {
  return Boolean(readProgress().lessons?.[`${trackId}/${lessonId}`]?.done);
}

function trackDone(track) {
  return track.lessons.filter((lesson) => isDone(track.id, lesson.id)).length;
}

function countCatalog() {
  const tracks = state.catalog.tracks.length;
  let lessons = 0;
  let quiz = 0;
  let labs = 0;
  let faults = 0;
  for (const track of state.catalog.tracks) {
    lessons += track.counts.lessons;
    quiz += track.counts.quiz;
    labs += track.counts.labs;
    faults += track.counts.faults;
  }
  return { tracks, lessons, quiz, labs, faults };
}

function motionReduced() {
  if (settings.motion === "reduce") return true;
  if (settings.motion === "full") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
