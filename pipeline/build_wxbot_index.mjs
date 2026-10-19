/* Build the offline Webex chat index from this lab's own rooms and pages.
   Usage: node pipeline/build_wxbot_index.mjs
   Writes assets/data/wxbot-index.json. Do not edit that file by hand.
   Excerpts are clipped from the rooms. The engine does not invent a fact. */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tokens } from "../shared/pybot-chat/engine.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "assets/data/wxbot-index.json");

const SYN = {
  lgw: "gateway",
  sgw: "survivability",
  wxcc: "contact",
  wxcce: "enterprise",
  di: "dedicated",
  byoc: "pstn",
  e911: "emergency",
  redsky: "emergency",
  aa: "attendant",
  cq: "queue",
  hg: "hunt",
  ch: "control",
  vm: "voicemail",
  wfm: "workforce",
  wfo: "workforce",
  qm: "quality",
  ucm: "cucm",
  unifiedcm: "cucm",
};

const PAGES = [
  ["page:start", "start.html", "Start here"],
  ["page:downloads", "downloads.html", "Cheat Codes"],
  ["page:play", "play.html", "Play lab"],
  ["page:ports", "ports.html", "Ports and protocols"],
  ["page:glossary", "glossary.html", "Glossary"],
  ["page:labs", "labs.html", "Hands-on Labs"],
  ["page:sip-sim", "sip-sim.html", "SIP ladder simulation"],
  ["page:home", "index.html", "Webex Lab Free University"],
  ["page:help", "help.html", "Help"],
  ["page:flows", "flows.html", "Animated flows"],
];

function plain(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function section(html, id) {
  const re = new RegExp(`<section id="${id}"[\\s\\S]*?</section>`, "i");
  const match = html.match(re);
  if (!match) return "";
  return match[0]
    .replace(/<p class="sec-kicker"[^>]*>[\s\S]*?<\/p>/gi, " ")
    .replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, " ");
}

function clip(text, max = 420) {
  const clean = plain(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "));
  if (stop > 80) return cut.slice(0, stop + 1);
  return cut.trim();
}

function h1(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? plain(match[1]) : "";
}

function lede(html) {
  const match = html.match(/<p class="lede"[^>]*>([\s\S]*?)<\/p>/i);
  return match ? plain(match[1]) : "";
}

function ledgerDate(roomId) {
  const path = join(root, "cites", `${roomId}.md`);
  try {
    const text = readFileSync(path, "utf8").slice(0, 500);
    const match = text.match(/Retrieved (\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : "";
  } catch {
    return "";
  }
}

function decorate(excerpt, roomId, sourceText) {
  let text = excerpt;
  const date = ledgerDate(roomId);
  if (date) text += ` Cited in this lab's ledger as retrieved ${date}.`;
  if (/re-?check/i.test(sourceText)) {
    text += " The room marks part of this as re-check, so treat that part as unconfirmed.";
  }
  return text;
}

const docs = [];

function add(doc) {
  const bodyText = [doc.ti, doc.body].filter(Boolean).join("\n");
  docs.push({
    i: doc.i,
    k: doc.k,
    ti: doc.ti,
    h: doc.h,
    s: doc.s || "",
    ex: doc.ex,
    eg: doc.eg || "",
    fu: doc.fu || "",
    fq: doc.fq || "",
    w: tokens(bodyText, SYN, 3),
    tw: tokens(doc.ti, SYN, 2),
  });
}

const roomDir = join(root, "rooms");
const files = readdirSync(roomDir).filter((name) => name.endsWith(".html")).sort();
for (const file of files) {
  const html = readFileSync(join(roomDir, file), "utf8");
  const idMatch = html.match(/data-room="([^"]+)"/);
  const roomId = idMatch ? idMatch[1] : file.replace(/\.html$/, "");
  const title = h1(html) || roomId;
  const tldr = section(html, "tldr");
  const core = section(html, "core");
  const limits = section(html, "limits");
  const trouble = section(html, "trouble");
  const source = [tldr, core, limits, trouble].filter(Boolean).join("\n");
  const base = clip(plain(tldr) || title, 320);
  add({
    i: `room:${roomId}`,
    k: "lesson",
    ti: title,
    h: `rooms/${file}#tldr`,
    s: roomId.slice(0, 2),
    ex: decorate(base, roomId, plain(source)),
    body: plain(source) || title,
    fu: "Where do I start?",
    fq: "Where do I start?",
  });
}

for (const [id, file, fallback] of PAGES) {
  let html = "";
  try {
    html = readFileSync(join(root, file), "utf8");
  } catch {
    continue;
  }
  const title = h1(html) || fallback;
  const lead = lede(html) || title;
  add({
    i: id,
    k: "page",
    ti: title,
    h: file,
    s: "page",
    ex: clip(lead, 360),
    body: `${title} ${lead}`,
    fu: "What can you help with?",
    fq: "What can you help with?",
  });
}

const seeds = docs.filter((doc) => doc.k === "lesson").map((doc) => {
  const titleTokens = [...new Set(doc.tw)].filter((term) => term.length >= 4).slice(0, 4);
  return {
    i: doc.i,
    h: doc.h,
    ti: doc.ti,
    k: "lesson",
    ex: doc.ex,
    eg: "",
    topic: titleTokens[0] || "webex",
    all: titleTokens.slice(0, 2),
    any: titleTokens,
    allow: titleTokens,
    how: false,
    rank: 1,
  };
}).filter((seed) => seed.any.length);

const index = { v: 2, syn: SYN, seeds, docs };
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(index)}\n`);
const bytes = Buffer.byteLength(JSON.stringify(index));
console.log(`wxbot index: ${docs.length} docs, ${seeds.length} seeds, ${bytes} bytes`);
