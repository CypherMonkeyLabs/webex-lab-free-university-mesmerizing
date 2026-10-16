/**
 * Build guide/kb/*.json from this repo's own rooms, glossary, flows,
 * diagrams, flashcards, and cheat sheets. No network. No invented facts.
 *
 * Run: node guide/build-kb.mjs
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "guide", "kb");

const SHEET_ROOM = {
  "ports-protocols": "T7-R03",
  "control-hub-roles": "T1-R05",
  "dial-plan": "T2-R03",
  "dedicated-instance": "T5-R01",
  "flow-designer": "T8-R01",
  "e911": "T2-R06",
  "identity-sync": "T1-R02",
  licensing: "T1-R03",
  "licensing-certs": "T1-R03",
  "devices-provisioning": "T2-R04",
  survivability: "T2-R07",
  troubleshooting: "T1-R06",
  "pstn-byoc": "T2-R02",
  "recording-qm": "T2-R06",
  "media-nat": "T7-R03",
  "migration-cutover": "T6-R01",
  "number-porting": "T6-R06",
  "wxcc-routing": "T3-R03",
  "crm-apis": "T8-R03",
  "ai-agents": "T8-R05",
  "analyzer-reports": "T3-R07",
  wfm: "T3-R09",
  security: "T2-R06",
  "call-flows": "T2-R01",
  glossary: "T1-R01",
  "config-checklist": "T1-R01",
  "careers-certs": "T6-R01"
};

const PAGE_HELP = {
  "index.html": "Start Here opens the sequence. Track tiles open a track. The room search is the list with id rooms.",
  "start.html": "Read the sequence on this page before you jump to a dial plan. The links are the order the lab recommends.",
  "glossary.html": "Filter the terms. Open a term to land in the room that defines it. Definitions stay in the rooms.",
  "flows.html": "Each card is an animated SVG. Open the SVG file link under the drawing. The packet moves when motion is allowed.",
  "diagrams.html": "Each card is a study drawing. The note on the drawing says to read the room before treating a hop as a product limit.",
  "charts.html": "Charts on this page are study charts. Read the caption next to the chart before you quote a number.",
  "downloads.html": "Cheat sheets are one HTML page each, with a PDF and a PNG beside them. Open a sheet, then the room it points at.",
  "quizzes.html": "This bank is practice beside the room quizzes. Reveals on a room still belong to that room.",
  "flashcards.html": "Know and Again stay in this browser. Nothing is uploaded. The card names the room it came from.",
  "labs.html": "The labs are browser models. They cite the sentence they imitate. They are not a live cluster.",
  "play.html": "Play is practice in this browser. When a score is shown, it is for that model only.",
  "interviews.html": "Each prompt cites a written room. Answer from that room, then open it to check.",
  "mastery.html": "Rows are a path through the lab. Anything the lab will not pretend to know is marked unverified.",
  "drills.html": "Each case has a cited fix. Open the room named on the case before you change a design.",
  "ecosystem.html": "The mind map is the eleven tracks. The concept map is orientation, not a product blueprint.",
  "ecosystem-atlas.html": "Drawings here are study drawings. They are not Cisco architecture blueprints.",
  "ports.html": "Port numbers on this page come from the rooms and the ports cheat sheet. Open the cited room before you write an ACL.",
  "careers.html": "This page is career context for the lab. It is not a job offer and not a Cisco certification claim.",
  "regions.html": "Residency notes on this page point back at the data-residency room. Confirm the country in that room."
};

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function decode(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function strip(html) {
  return decode(String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function clip(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function attr(html, name) {
  const match = html.match(new RegExp("<body[^>]*\\b" + name + '="([^"]*)"', "i"));
  return match ? decode(match[1]) : "";
}

function first(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1] : "";
}

function keywords(value) {
  const stop = new Set("the a an to of and or in on for is this that with from into your you are be as at by it its their they not can how what when where which who why does do did".split(" "));
  const words = String(value || "").toLowerCase().replace(/[^a-z0-9+.\-\s]/g, " ").split(/\s+/);
  const out = [];
  words.forEach(function (word) {
    if (!word || word.length < 3 || stop.has(word) || out.indexOf(word) !== -1) return;
    out.push(word);
  });
  return out.slice(0, 16);
}

function difficultyOf(label) {
  const text = String(label || "").toUpperCase();
  if (text.indexOf("L1") !== -1 || text.indexOf("L0") !== -1) return "easy";
  if (text.indexOf("L2") !== -1) return "medium";
  if (text.indexOf("L3") !== -1 || text.indexOf("L4") !== -1 || text.indexOf("L5") !== -1) return "hard";
  return "medium";
}

function loadIndex() {
  const raw = read("assets/js/search-index.js").replace(/^window\.CANON_INDEX\s*=\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(raw);
}

function loadStudy() {
  const raw = read("assets/js/study-index.js").replace(/^window\.CANON_STUDY\s*=\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(raw);
}

function roomFiles() {
  return readdirSync(join(root, "rooms")).filter((name) => name.endsWith(".html")).sort();
}

function parseRoom(file) {
  const html = read(join("rooms", file));
  const id = attr(html, "data-room") || file.slice(0, 6);
  const title = attr(html, "data-room-title") || strip(first(html, /<h1>([\s\S]*?)<\/h1>/i));
  const track = attr(html, "data-track") || id.slice(0, 2);
  const lede = clip(strip(first(html, /<p class="lede">([\s\S]*?)<\/p>/i)), 420);
  const diffLabel = strip(first(html, /Difficulty\s*<strong>([^<]+)<\/strong>/i));
  const difficulty = difficultyOf(diffLabel);
  const takeaways = [];
  const takeBlock = first(html, /<aside class="takeaways"[\s\S]*?<ul>([\s\S]*?)<\/ul>/i);
  if (takeBlock) {
    for (const item of takeBlock.matchAll(/<li>([\s\S]*?)<\/li>/gi)) {
      const text = clip(strip(item[1]), 420);
      if (text) takeaways.push(text);
    }
  }
  const sections = [];
  for (const block of html.matchAll(/<section\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/gi)) {
    const heading = strip(first(block[2], /<h2>([\s\S]*?)<\/h2>/i)) || block[1];
    const paragraph = clip(strip(first(block[2], /<(?:p|li)>([\s\S]*?)<\/(?:p|li)>/i)), 420);
    if (paragraph) sections.push({ id: block[1], title: heading, text: paragraph });
  }
  const trouble = [];
  const troubleSection = first(html, /<section\s+id="trouble"[^>]*>([\s\S]*?)<\/section>/i);
  if (troubleSection) {
    for (const row of troubleSection.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)].map((cell) => clip(strip(cell[1]), 240));
      if (cells.length >= 4 && cells[0] && cells[0] !== "Symptom") {
        trouble.push({ symptom: cells[0], cause: cells[1], check: cells[2], fix: cells[3] });
      }
    }
  }
  const ladder = [];
  for (const node of html.matchAll(/<summary><span class="lvl">([^<]*)<\/span>([\s\S]*?)<\/summary>\s*<p class="answer">([\s\S]*?)<\/p>/gi)) {
    const level = strip(node[1]);
    const question = clip(strip(node[2]), 200);
    const answer = clip(strip(node[3]), 420);
    if (question && answer) ladder.push({ level, question, answer });
  }
  const quizzes = [];
  const quizSection = first(html, /<section\s+id="quiz"[^>]*>([\s\S]*?)<\/section>/i);
  if (quizSection) {
    for (const card of quizSection.matchAll(/<article class="qcard">([\s\S]*?)<\/article>/gi)) {
      const question = clip(strip(first(card[1], /<p>([\s\S]*?)<\/p>/i)), 360);
      const choices = [...card[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((item) => clip(strip(item[1]), 180)).filter(Boolean);
      const why = clip(strip(first(card[1], /<details[\s\S]*?<p>([\s\S]*?)<\/p>/i)), 420);
      const letter = why.match(/^([A-D])\b/);
      if (!question || !why) continue;
      if (letter && choices.length >= 2) {
        const answer = letter[1].charCodeAt(0) - 65;
        if (answer >= 0 && answer < choices.length) {
          quizzes.push({ question, choices, answer, why });
          continue;
        }
      }
      quizzes.push({ question, choices: [], answer: -1, why });
    }
  }
  const audio = [];
  for (const slot of html.matchAll(/<article class="audio-slot">([\s\S]*?)<\/article>/gi)) {
    const slotTitle = strip(first(slot[1], /<h3>([\s\S]*?)<\/h3>/i));
    const prompt = clip(strip(first(slot[1], /<p class="prompt">([\s\S]*?)<\/p>/i)), 320);
    const file = strip(first(slot[1], /Expected file:\s*([^<]+)/i));
    if (slotTitle) audio.push({ title: slotTitle, prompt, file });
  }
  return {
    id,
    title,
    href: "rooms/" + file,
    track,
    lede,
    difficulty,
    diffLabel,
    takeaways,
    sections,
    trouble,
    ladder,
    quizzes,
    audio
  };
}

function svgNotes(file) {
  const html = read(file);
  const texts = [...html.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map((item) => strip(item[1]))
    .filter((text) => text && text.length > 2 && !/^Hop \d+$/.test(text));
  const unique = [];
  texts.forEach((text) => {
    if (unique.indexOf(text) === -1) unique.push(text);
  });
  return unique.slice(0, 8);
}

function parseAtlas(file, kind) {
  const html = read(file);
  const items = [];
  for (const card of html.matchAll(/<article class="atlas-card"[^>]*>([\s\S]*?)<\/article>/gi)) {
    const title = strip(first(card[1], /<h2>([\s\S]*?)<\/h2>/i));
    const blurb = strip(first(card[1], /<p>([\s\S]*?)<\/p>/i));
    const svg = first(card[1], /data="([^"]+\.svg)"/i);
    const flow = /data-flow="1"/.test(card[0] + card[1].slice(0, 80)) || /data-flow="1"/.test(card[1]);
    const notes = svg ? svgNotes(svg) : [];
    if (!title) continue;
    items.push({
      id: (svg || title).split("/").pop().replace(/\.svg$/, ""),
      title,
      blurb,
      href: file + "#" + (svg || title),
      svg: svg || "",
      page: file,
      kind,
      flow,
      notes
    });
  }
  return items;
}

function parseSheets() {
  const dir = join(root, "downloads", "sheets");
  return readdirSync(dir).filter((name) => name.endsWith(".html")).sort().map((name) => {
    const html = read(join("downloads", "sheets", name));
    const title = strip(first(html, /<h1>([\s\S]*?)<\/h1>/i));
    const lede = clip(strip(first(html, /<h1>[\s\S]*?<\/h1>\s*<p>([\s\S]*?)<\/p>/i)), 360);
    const rows = [];
    for (const row of html.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)].map((cell) => clip(strip(cell[1]), 240));
      if (cells.length >= 2 && cells[0]) rows.push({ item: cells[0], remember: cells[1], source: cells[2] || "" });
    }
    const id = name.replace(/\.html$/, "");
    return { id, title, lede, href: "downloads/sheets/" + name, room: SHEET_ROOM[id] || "", rows };
  });
}

function pageRecord(file) {
  let html = "";
  try {
    html = read(file);
  } catch (error) {
    return null;
  }
  const title = strip(first(html, /<title>([\s\S]*?)<\/title>/i)).replace(/\s*·.*$/, "").replace(/\s*\|.*$/, "");
  const lede = clip(strip(first(html, /<p class="lede">([\s\S]*?)<\/p>/i)), 360);
  return {
    id: file.replace(/\.html$/, ""),
    file,
    title: title || file,
    lede,
    howTo: PAGE_HELP[file] || "Use the headings on this page. If a claim matters, open the room it cites.",
    keywords: keywords(title + " " + lede + " " + file)
  };
}

function writeJson(name, value) {
  writeFileSync(join(outDir, name), JSON.stringify(value));
}

function main() {
  mkdirSync(outDir, { recursive: true });
  const index = loadIndex();
  const study = loadStudy();
  const trackNames = {};
  const curriculum = [];
  const roomById = {};
  (index.tracks || []).forEach((track) => {
    trackNames[track.id] = track.name;
    (track.rooms || []).forEach((room) => {
      curriculum.push({
        room: room.code,
        title: room.title,
        href: room.href,
        track: track.id,
        trackName: track.name
      });
      roomById[room.code] = room;
    });
  });

  const rooms = roomFiles().map(parseRoom);
  rooms.forEach((room) => {
    room.trackName = trackNames[room.track] || room.track;
    if (!room.title && roomById[room.id]) room.title = roomById[room.id].title;
  });
  const knownRooms = new Set(rooms.map((room) => room.id));

  const facts = [];
  const quizzes = [];
  const lessons = [];
  const tours = [];
  let factN = 0;
  function addFact(entry) {
    factN += 1;
    const cite = entry.cite || (entry.roomTitle ? entry.roomTitle + (entry.room ? " (" + entry.room + ")" : "") : "this lab");
    facts.push({
      id: "f" + factN,
      text: clip(entry.text, 480),
      room: entry.room || "",
      roomTitle: entry.roomTitle || "",
      href: entry.href || "",
      cite,
      kind: entry.kind || "note",
      difficulty: entry.difficulty || "medium",
      weight: entry.weight == null ? 1 : entry.weight,
      keywords: keywords((entry.keywords || "") + " " + entry.text + " " + (entry.roomTitle || ""))
    });
  }

  rooms.forEach((room) => {
    const cite = room.title + " (" + room.id + ")";
    if (room.lede) {
      addFact({ text: room.lede, room: room.id, roomTitle: room.title, href: room.href, cite, kind: "lede", difficulty: "easy", weight: 4, keywords: room.title });
    }
    room.takeaways.forEach((text) => {
      addFact({ text, room: room.id, roomTitle: room.title, href: room.href + "#tldr", cite, kind: "takeaway", difficulty: "easy", weight: 5, keywords: room.title });
    });
    room.sections.forEach((section) => {
      if (section.id === "quiz" || section.id === "audio") return;
      addFact({
        text: section.title + ": " + section.text,
        room: room.id,
        roomTitle: room.title,
        href: room.href + "#" + section.id,
        cite,
        kind: "section",
        difficulty: section.id === "limits" || section.id === "trouble" ? "hard" : room.difficulty,
        weight: 3,
        keywords: section.title + " " + room.title
      });
    });
    room.trouble.forEach((row) => {
      addFact({
        text: "Symptom: " + row.symptom + " Likely cause: " + row.cause + " Check: " + row.check + " Fix: " + row.fix,
        room: room.id,
        roomTitle: room.title,
        href: room.href + "#trouble",
        cite,
        kind: "trouble",
        difficulty: "hard",
        weight: 4,
        keywords: row.symptom + " " + row.fix
      });
    });
    room.ladder.forEach((step) => {
      addFact({
        text: step.level + " " + step.question + " " + step.answer,
        room: room.id,
        roomTitle: room.title,
        href: room.href + "#selfq",
        cite,
        kind: "ladder",
        difficulty: /^L[34]/.test(step.level) ? "hard" : /^L[12]/.test(step.level) ? "medium" : "easy",
        weight: 3,
        keywords: step.question
      });
    });
    room.audio.forEach((slot) => {
      const fileBit = slot.file ? " Expected file: " + slot.file + "." : "";
      const promptBit = slot.prompt ? " Prompt in the room: " + slot.prompt : "";
      addFact({
        text: "Recording slot “" + slot.title + "”." + promptBit + fileBit + " Press play on the audio control in the Audio section. If the file is missing, the room has not been recorded yet.",
        room: room.id,
        roomTitle: room.title,
        href: room.href + "#audio",
        cite,
        kind: "recording",
        difficulty: "easy",
        weight: 2,
        keywords: slot.title + " recording audio"
      });
    });
    let quizN = 0;
    room.quizzes.forEach((quiz) => {
      if (quiz.answer >= 0) {
        quizN += 1;
        quizzes.push({
          id: room.id + "-q" + quizN,
          question: quiz.question,
          choices: quiz.choices,
          answer: quiz.answer,
          why: quiz.why,
          room: room.id,
          roomTitle: room.title,
          href: room.href + "#quiz",
          difficulty: room.difficulty
        });
      }
      addFact({
        text: quiz.question + " " + quiz.why,
        room: room.id,
        roomTitle: room.title,
        href: room.href + "#quiz",
        cite,
        kind: "quiz",
        difficulty: room.difficulty,
        weight: 3,
        keywords: quiz.question
      });
    });

    const steps = [];
    if (room.lede) steps.push({ title: "What this room is", text: room.lede, href: room.href });
    room.takeaways.slice(0, 3).forEach((text, index) => {
      steps.push({ title: "Takeaway " + (index + 1), text, href: room.href + "#tldr" });
    });
    const core = room.sections.find((section) => section.id === "core") || room.sections.find((section) => section.id === "map");
    if (core) steps.push({ title: core.title, text: core.text, href: room.href + "#" + core.id });
    if (room.trouble[0]) {
      const row = room.trouble[0];
      steps.push({
        title: "One thing that breaks",
        text: row.symptom + " — " + row.fix,
        href: room.href + "#trouble"
      });
    }
    const check = room.quizzes.find((quiz) => quiz.answer >= 0);
    if (check) {
      steps.push({
        title: "Check",
        text: check.question,
        href: room.href + "#quiz",
        choices: check.choices,
        answer: check.answer,
        why: check.why
      });
    }
    lessons.push({
      id: room.id,
      room: room.id,
      title: room.title,
      href: room.href,
      track: room.track,
      difficulty: room.difficulty,
      keywords: keywords(room.title + " " + room.lede),
      steps
    });

    tours.push({
      id: "room-" + room.id,
      match: [room.href.split("/").pop()],
      room: room.id,
      title: room.title,
      steps: [
        { href: room.href, selector: "h1", text: room.title + ". " + clip(room.lede, 180) },
        { href: room.href, selector: ".takeaways", text: "Key takeaways are the short cited list near the top of " + room.title + "." },
        { href: room.href + "#quiz", selector: "#quiz", text: "The quiz in " + room.title + " stays closed until you open a reveal." },
        { href: room.href + "#audio", selector: "#audio", text: "Audio slots for " + room.title + " are in this section. Press play if a file is attached." },
        { href: room.href, selector: ".toc, .v4-toc", text: "This list jumps between sections of " + room.title + "." }
      ]
    });
  });

  const cards = JSON.parse(read("downloads/flashcards.json")).cards.map((card, index) => {
    const roomMatch = String(card.source || "").match(/T\d-R\d\d/);
    const room = roomMatch ? roomMatch[0] : "";
    const roomTitle = (rooms.find((item) => item.id === room) || {}).title || "";
    return {
      id: "c" + (index + 1),
      front: clip(card.front, 240),
      back: clip(card.back, 360),
      source: card.source || "",
      room,
      roomTitle,
      href: room && roomById[room] ? roomById[room].href : "flashcards.html"
    };
  });
  cards.forEach((card) => {
    const cite = card.roomTitle ? card.roomTitle + " (" + card.room + ")" : (card.source || "Flashcards");
    addFact({
      text: card.front + " — " + card.back,
      room: card.room,
      roomTitle: card.roomTitle || "Flashcards",
      href: card.href,
      cite: card.room ? cite : "Flashcards. " + (card.source || "downloaded deck"),
      kind: "card",
      difficulty: "medium",
      weight: 4,
      keywords: card.front
    });
  });

  const termRoom = new Map();
  (study.cards || []).forEach((row) => {
    const term = row[1];
    const room = row[2];
    if (!term || !room || !knownRooms.has(room)) return;
    const key = term.toLowerCase();
    if (!termRoom.has(key)) termRoom.set(key, { term, room });
  });
  termRoom.forEach((entry) => {
    const room = rooms.find((item) => item.id === entry.room);
    if (!room) return;
    const defined = cards.find((card) => card.front.toLowerCase() === entry.term.toLowerCase() && card.back);
    if (defined) return;
    addFact({
      text: "The glossary lists “" + entry.term + "” under " + room.title + ". Open that room for the definition. I don't have a separate definition sentence stored for this term.",
      room: room.id,
      roomTitle: room.title,
      href: room.href,
      cite: room.title + " (" + room.id + ")",
      kind: "glossary",
      difficulty: "easy",
      weight: 2,
      keywords: entry.term
    });
  });

  const sheets = parseSheets();
  sheets.forEach((sheet) => {
    const room = rooms.find((item) => item.id === sheet.room);
    const cite = room ? room.title + " (" + room.id + "), via the " + sheet.title + " cheat sheet" : sheet.title + " cheat sheet";
    if (sheet.lede) {
      addFact({
        text: sheet.lede,
        room: room ? room.id : "",
        roomTitle: room ? room.title : sheet.title,
        href: sheet.href,
        cite,
        kind: "sheet",
        difficulty: "medium",
        weight: 3,
        keywords: sheet.title
      });
    }
    sheet.rows.forEach((row) => {
      const sourceBit = row.source ? " Source note: " + row.source + "." : "";
      addFact({
        text: row.item + ": " + row.remember + "." + sourceBit,
        room: room ? room.id : "",
        roomTitle: room ? room.title : sheet.title,
        href: sheet.href,
        cite,
        kind: "sheet",
        difficulty: "medium",
        weight: 4,
        keywords: row.item + " " + sheet.title
      });
    });
  });

  const diagrams = parseAtlas("diagrams.html", "diagram");
  const flows = parseAtlas("flows.html", "flow");
  const seenDrawing = new Set();
  diagrams.concat(flows).forEach((item) => {
    if (seenDrawing.has(item.id + item.kind)) return;
    seenDrawing.add(item.id + item.kind);
    const caution = item.notes.find((note) => /study drawing/i.test(note)) || "Study drawing. Read the room before you treat a hop as a product limit.";
    const subtitle = item.notes.filter((note) => note !== item.title && !/study drawing/i.test(note));
    const sentence = subtitle.length ? subtitle.join(". ") : item.title + " is on the " + item.kind + " page. " + item.blurb + ".";
    addFact({
      text: item.title + ". " + sentence + " " + caution,
      room: "",
      roomTitle: item.kind === "flow" ? "Animated flows" : "Diagram atlas",
      href: item.page,
      cite: (item.kind === "flow" ? "Animated flows" : "Diagram atlas") + " — " + item.title,
      kind: item.kind,
      difficulty: "medium",
      weight: 3,
      keywords: item.title + " " + item.id.replace(/-/g, " ")
    });
  });

  const pages = ["index.html", "start.html", "glossary.html", "flows.html", "diagrams.html", "charts.html", "downloads.html", "quizzes.html", "flashcards.html", "labs.html", "play.html", "interviews.html", "mastery.html", "drills.html", "ecosystem.html", "ecosystem-atlas.html", "ports.html", "careers.html", "regions.html"]
    .map(pageRecord)
    .filter(Boolean);
  pages.forEach((page) => {
    if (!page.lede) return;
    addFact({
      text: page.lede,
      room: "",
      roomTitle: page.title,
      href: page.file,
      cite: page.title,
      kind: "page",
      difficulty: "easy",
      weight: 2,
      keywords: page.keywords.join(" ")
    });
  });

  tours.unshift(
    {
      id: "home",
      match: ["index.html", ""],
      title: "Front door",
      steps: [
        { href: "index.html", selector: ".world-title, h1", text: "Front door of the lab. Eleven tracks, read offline." },
        { href: "index.html", selector: "a.btn[href='start.html'], a[href='start.html']", text: "Start Here is the sequence: Control Hub before a dial plan." },
        { href: "index.html", selector: "#rooms", text: "The room list and search live here." },
        { href: "index.html", selector: ".track-map", text: "Each tile is one track. Open it for that track's rooms." }
      ]
    },
    {
      id: "glossary",
      match: ["glossary.html"],
      title: "Glossary",
      steps: [
        { href: "glossary.html", selector: "h1", text: "Terms collected from the written rooms." },
        { href: "glossary.html", selector: "#glossary-q", text: "Filter from this box. Open a term to land in its room." }
      ]
    },
    {
      id: "flows",
      match: ["flows.html"],
      title: "Flows",
      steps: [
        { href: "flows.html", selector: "h1", text: "Animated flows. Each card is a custom SVG with a moving packet." },
        { href: "flows.html", selector: ".atlas-card", text: "Open the SVG file link under a card to see that flow." }
      ]
    },
    {
      id: "diagrams",
      match: ["diagrams.html"],
      title: "Diagrams",
      steps: [
        { href: "diagrams.html", selector: "h1", text: "Diagram atlas. These are study drawings, not product screenshots." },
        { href: "diagrams.html", selector: ".atlas-card", text: "Open a card's SVG. Read the room before you treat a hop as a limit." }
      ]
    }
  );

  const portCards = cards.filter((card) => /tcp|udp|\b\d{3,5}\b/i.test(card.front + " " + card.back));
  const games = { ports: [], rooms: [] };
  portCards.slice(0, 48).forEach((card, index) => {
    const decoys = portCards.filter((other) => other.id !== card.id).slice(index, index + 3);
    while (decoys.length < 3) {
      const extra = cards[(index + decoys.length + 3) % cards.length];
      if (extra && extra.id !== card.id) decoys.push(extra);
      else break;
    }
    const choices = [card.back].concat(decoys.map((item) => item.back)).slice(0, 4);
    games.ports.push({
      id: "gp" + (index + 1),
      prompt: card.front,
      choices,
      answer: 0,
      why: card.back,
      href: card.href,
      cite: card.roomTitle ? card.roomTitle + " (" + card.room + ")" : (card.source || "Flashcards")
    });
  });
  const takeawayFacts = facts.filter((fact) => fact.kind === "takeaway");
  takeawayFacts.slice(0, 48).forEach((fact, index) => {
    const correct = fact.roomTitle || fact.cite;
    const others = [];
    for (let shift = 1; others.length < 3 && shift < rooms.length; shift += 1) {
      const candidate = rooms[(index + shift * 7) % rooms.length];
      if (candidate.title !== correct) others.push(candidate.title);
    }
    games.rooms.push({
      id: "gr" + (index + 1),
      prompt: fact.text,
      choices: [correct].concat(others),
      answer: 0,
      why: "That sentence is from " + fact.cite + ".",
      href: fact.href,
      cite: fact.cite
    });
  });

  const roomOut = rooms.map((room) => ({
    id: room.id,
    title: room.title,
    href: room.href,
    track: room.track,
    trackName: room.trackName,
    lede: room.lede,
    difficulty: room.difficulty,
    howTo: "You are in " + room.title + " (" + room.id + (room.trackName ? ", " + room.trackName : "") + "). Read the header, then the TL;DR takeaways. The section list jumps to Map, Core, Trouble, Lab, Quiz, and Audio. Quiz reveals stay closed until you open them. Audio slots name an expected file; press play on that player. " + (room.audio[0] ? "One slot on this page is “" + room.audio[0].title + "”." : "This room has no audio slot in the notes."),
    sections: room.sections.map((section) => ({ id: section.id, title: section.title })),
    audio: room.audio,
    keywords: keywords(room.title + " " + room.lede + " " + room.id)
  }));

  const synonyms = {
    ch: "control hub",
    "admin portal": "control hub",
    lgw: "local gateway",
    cube: "local gateway",
    wxcc: "webex contact center",
    "contact center": "webex contact center",
    wxcce: "webex contact center enterprise",
    ucce: "unified cce",
    pcce: "packaged cce",
    di: "dedicated instance",
    pstn: "pstn local gateway",
    byoc: "bring your own carrier local gateway",
    e911: "emergency calling",
    "red sky": "redsky",
    cert: "certificate",
    "5062": "certificate trunk tcp 5062",
    "8934": "registration trunk tcp 8934",
    scim: "scim directory",
    sso: "single sign on",
    vm: "voicemail",
    aa: "auto attendant",
    cq: "call queue",
    hg: "hunt group"
  };

  const intents = [
    { id: "identity", phrases: ["who are you", "what are you", "your name", "are you a bot", "are you human"] },
    { id: "help", phrases: ["how do i use this", "how do i use", "how to use this", "help me use this", "what do i do here", "how does this page work", "how does this room work"] },
    { id: "tour", phrases: ["tour", "show me around", "guide me", "2-minute tour", "two minute tour", "walk me around"] },
    { id: "quiz", phrases: ["quiz me", "test me", "practice questions", "ask me a question"] },
    { id: "daily", phrases: ["daily challenge", "daily quiz", "today's question", "todays question"] },
    { id: "cards", phrases: ["flashcards", "flash cards", "flashcard", "drill cards", "know or again"] },
    { id: "lesson", phrases: ["teach me", "lesson on", "walk me through", "step by step"] },
    { id: "more", phrases: ["tell me more", "more detail", "go on", "keep going", "what else", "and then"] },
    { id: "progress", phrases: ["my progress", "what have we covered", "my score", "suggested next", "what next", "what's next", "whats next", "badges", "my streak", "streak"] },
    { id: "game", phrases: ["mini-game", "mini game", "play a game", "port game", "room game"] },
    { id: "easy", phrases: ["easy mode", "easier", "beginner"] },
    { id: "medium", phrases: ["medium mode", "normal mode"] },
    { id: "hard", phrases: ["hard mode", "harder", "advanced"] },
    { id: "start", phrases: ["where do i start", "where to start", "getting started", "start here", "first room"] },
    { id: "voice-on", phrases: ["read aloud", "voice on", "speak answers", "turn voice on"] },
    { id: "voice-off", phrases: ["stop reading", "voice off", "mute the voice", "turn voice off"] }
  ];

  writeJson("rooms.json", roomOut);
  const factChunks = 4;
  const factFiles = [];
  const chunkSize = Math.ceil(facts.length / factChunks);
  for (let index = 0; index < factChunks; index += 1) {
    const name = "facts-" + index + ".json";
    factFiles.push(name);
    writeJson(name, facts.slice(index * chunkSize, (index + 1) * chunkSize));
  }
  writeJson("quizzes.json", quizzes);
  writeJson("cards.json", cards.map((card) => ({
    id: card.id, front: card.front, back: card.back, source: card.source, room: card.room, roomTitle: card.roomTitle, href: card.href
  })));
  writeJson("lessons.json", lessons);
  writeJson("tours.json", tours);
  writeJson("flows.json", { diagrams, flows, sheets: sheets.map((sheet) => ({ id: sheet.id, title: sheet.title, href: sheet.href, lede: sheet.lede, room: sheet.room })) });
  writeJson("index.json", {
    builtFrom: "rooms, glossary index, flashcards, cheat sheets, flows, diagrams",
    counts: {
      rooms: roomOut.length,
      facts: facts.length,
      quizzes: quizzes.length,
      cards: cards.length,
      lessons: lessons.length,
      tours: tours.length
    },
    factFiles,
    intents,
    synonyms,
    pages,
    curriculum,
    games
  });

  if (roomOut.length < 60) throw new Error("expected 60 rooms, have " + roomOut.length);
  if (facts.length < 400) throw new Error("expected 400 facts, have " + facts.length);
  if (quizzes.length < 40) throw new Error("expected 40 quizzes, have " + quizzes.length);
  const missingCite = facts.filter((fact) => !fact.cite || !fact.text || !fact.href);
  if (missingCite.length) throw new Error("facts missing cite " + missingCite.length);
  console.log("guide kb", roomOut.length, "rooms", facts.length, "facts", quizzes.length, "quizzes", cards.length, "cards", lessons.length, "lessons");
}

main();
