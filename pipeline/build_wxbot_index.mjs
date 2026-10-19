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

const CITED = [
  { file: "rooms/T1-R04-locations-sites.html", roomId: "T1-R04", all: ["location", "webex", "calling"], allow: ["location", "webex", "calling", "site"] },
  { file: "rooms/T1-R05-admin-roles-partner.html", roomId: "T1-R05", all: ["location", "administrator", "control", "hub"], allow: ["location", "administrator", "control", "hub", "admin", "role"] },
  { file: "rooms/T1-R06-analytics-troubleshooting.html", roomId: "T1-R06", all: ["troubleshoot", "calling"], allow: ["look", "webex", "calling", "troubleshoot", "control", "hub", "analyt"] },
  { file: "rooms/T2-R02-local-gateway-pstn.html", roomId: "T2-R02", all: ["local", "gateway"], allow: ["local", "gateway", "webex", "calling", "pstn", "trunk"] },
  { file: "rooms/T2-R05-call-features.html", roomId: "T2-R05", all: ["hunt", "group"], allow: ["hunt", "group", "webex", "calling", "queue", "feature"] },
  { file: "rooms/T3-R03-entry-points-queues-routing.html", roomId: "T3-R03", all: ["queue", "contact", "center"], allow: ["queue", "webex", "contact", "center", "entry", "rout"] },
  { file: "rooms/T3-R04-agent-desktop-supervisor.html", roomId: "T3-R04", all: ["agent", "desktop"], allow: ["agent", "desktop", "webex", "contact", "center", "supervisor"] },
  { file: "rooms/T3-R07-analyzer-reporting.html", roomId: "T3-R07", all: ["analyzer", "contact", "center"], allow: ["analyzer", "webex", "contact", "center", "report"] },
  { file: "rooms/T4-R04-scripting-icm-routing.html", roomId: "T4-R04", all: ["icm", "script"], allow: ["icm", "script", "scripting", "enterprise", "wxcce", "rout"] },
  { file: "rooms/T4-R06-finesse-desktop-gadgets.html", roomId: "T4-R06", all: ["finesse"], allow: ["finesse", "enterprise", "wxcce", "desktop", "gadget"] },
  { file: "rooms/T5-R01-what-dedicated-instance-is.html", roomId: "T5-R01", all: ["dedicated", "instance"], allow: ["dedicated", "instance", "dedicat"] },
  { file: "rooms/T5-R02-di-architecture-peering.html", roomId: "T5-R02", all: ["dedicated", "instance", "peer"], allow: ["dedicated", "instance", "peer", "peering", "dedicat"] },
  { file: "rooms/T6-R02-cucm-to-webex-calling.html", roomId: "T6-R02", all: ["migrate", "cucm", "calling"], allow: ["migrate", "cucm", "user", "toward", "webex", "calling", "unified"] },
  { file: "rooms/T7-R01-sip-fundamentals-webex.html", roomId: "T7-R01", all: ["sip", "idea", "trunk"], allow: ["sip", "idea", "matter", "webex", "calling", "trunk"] },
];

function citedExcerpt(file, roomId) {
  const html = readFileSync(join(root, file), "utf8");
  const title = h1(html) || roomId;
  const tldr = plain(section(html, "tldr"));
  const source = [tldr, plain(section(html, "core"))].filter(Boolean).join(" ");
  return { title, ex: decorate(`${title}. ${clip(tldr || title, 280)}`, roomId, source) };
}

for (const spec of CITED) {
  const cited = citedExcerpt(spec.file, spec.roomId);
  seeds.push({
    i: `cited:${spec.roomId}:${spec.all.join("-")}`,
    h: `${spec.file}#tldr`,
    ti: cited.title,
    k: "lesson",
    ex: cited.ex,
    eg: "",
    topic: spec.all[0],
    all: spec.all,
    any: spec.all,
    allow: [...new Set([...spec.all, ...spec.allow])],
    how: false,
    loose: false,
    rank: 120,
  });
}

/* Curated from lesson titles and TL;DR text. Loose so a natural extra word
   still lands on the room. Rank stays under the tighter cited seeds. */
const GLOSSARY = [
  { file: "rooms/T1-R02-identity-directory-sync.html", roomId: "T1-R02", all: ["directory", "sync"], rank: 70 },
  { file: "rooms/T1-R03-licensing-subscriptions.html", roomId: "T1-R03", all: ["subscription"], rank: 70 },
  { file: "rooms/T1-R04-locations-sites.html", roomId: "T1-R04", all: ["location"], rank: 36, block: ["administrator", "subscription", "license", "licens"] },
  { file: "rooms/T1-R05-admin-roles-partner.html", roomId: "T1-R05", all: ["location", "administrator"], rank: 90 },
  { file: "rooms/T1-R06-analytics-troubleshooting.html", roomId: "T1-R06", all: ["analytics"], rank: 70, block: ["cdr"] },
  { file: "rooms/T1-R07-data-residency-security.html", roomId: "T1-R07", all: ["residency"], rank: 70 },
  { file: "rooms/T2-R01-calling-architecture.html", roomId: "T2-R01", all: ["registration", "pbx"], rank: 70 },
  { file: "rooms/T2-R03-dial-plans-pstn-routing.html", roomId: "T2-R03", all: ["dial"], rank: 60, block: ["peer", "peering"] },
  { file: "rooms/T2-R04-devices-provisioning.html", roomId: "T2-R04", all: ["mpp"], rank: 80 },
  { file: "rooms/T2-R05-call-features.html", roomId: "T2-R05", all: ["hunt", "group"], rank: 70 },
  { file: "rooms/T2-R06-calling-security-compliance.html", roomId: "T2-R06", all: ["933"], rank: 80 },
  { file: "rooms/T2-R07-survivability-gateway.html", roomId: "T2-R07", all: ["survivability"], rank: 70 },
  { file: "rooms/T2-R08-calling-analytics-cdr.html", roomId: "T2-R08", all: ["cdr"], rank: 80 },
  { file: "rooms/T3-R01-wxcc-multitenant-overview.html", roomId: "T3-R01", all: ["multi", "tenant"], rank: 80 },
  { file: "rooms/T3-R02-tenant-provisioning-setup.html", roomId: "T3-R02", all: ["tenant", "provision"], rank: 85 },
  { file: "rooms/T3-R03-entry-points-queues-routing.html", roomId: "T3-R03", all: ["entry", "queue"], rank: 80 },
  { file: "rooms/T3-R04-agent-desktop-supervisor.html", roomId: "T3-R04", all: ["agent", "desktop"], rank: 100 },
  { file: "rooms/T3-R05-voice-options.html", roomId: "T3-R05", all: ["voice", "option"], rank: 70 },
  { file: "rooms/T3-R06-digital-channels.html", roomId: "T3-R06", all: ["digital", "channel"], rank: 70, block: ["ai"] },
  { file: "rooms/T3-R07-analyzer-reporting.html", roomId: "T3-R07", all: ["analyzer", "report"], rank: 90 },
  { file: "rooms/T3-R08-supervisor-experience.html", roomId: "T3-R08", all: ["supervisor", "desktop"], rank: 80 },
  { file: "rooms/T4-R01-wxcc-enterprise-overview.html", roomId: "T4-R01", all: ["contact", "center", "enterprise"], rank: 40, block: ["component", "vxml", "cvp", "hybrid", "flow", "icm"] },
  { file: "rooms/T4-R02-core-components.html", roomId: "T4-R02", all: ["component", "enterprise"], rank: 110 },
  { file: "rooms/T4-R03-call-flow-wxcce.html", roomId: "T4-R03", all: ["enterprise", "flow"], rank: 100 },
  { file: "rooms/T4-R04-scripting-icm-routing.html", roomId: "T4-R04", all: ["icm"], rank: 160 },
  { file: "rooms/T4-R05-cvp-vxml-ivr.html", roomId: "T4-R05", all: ["vxml"], rank: 160 },
  { file: "rooms/T4-R06-finesse-desktop-gadgets.html", roomId: "T4-R06", all: ["finesse"], rank: 160 },
  { file: "rooms/T4-R07-reporting-cuic.html", roomId: "T4-R07", all: ["cuic"], rank: 160 },
  { file: "rooms/T5-R02-di-architecture-peering.html", roomId: "T5-R02", all: ["peering"], rank: 70 },
  { file: "rooms/T6-R02-cucm-to-webex-calling.html", roomId: "T6-R02", all: ["cucm", "move"], rank: 80 },
  { file: "rooms/T7-R01-sip-fundamentals-webex.html", roomId: "T7-R01", all: ["sip", "header"], rank: 80 },
  { file: "rooms/T8-R01-flow-designer-essentials.html", roomId: "T8-R01", all: ["flow", "designer"], rank: 80 },
  { file: "rooms/T9-R03-basic-qm.html", roomId: "T9-R03", all: ["quality", "recording"], rank: 80 },
];

const glossary = [];
for (const spec of GLOSSARY) {
  const cited = citedExcerpt(spec.file, spec.roomId);
  glossary.push({
    term: spec.all.join(" "),
    h: `${spec.file}#tldr`,
    ti: cited.title,
    ex: cited.ex,
  });
  seeds.push({
    i: `glossary:${spec.roomId}:${spec.all.join("-")}`,
    h: `${spec.file}#tldr`,
    ti: cited.title,
    k: "glossary",
    ex: cited.ex,
    eg: "",
    topic: spec.all[0],
    all: spec.all,
    any: spec.all,
    allow: spec.all,
    block: spec.block || [],
    how: false,
    loose: true,
    rank: spec.rank,
  });
}

const index = { v: 3, syn: SYN, seeds, docs, glossary };
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(index)}\n`);
const bytes = Buffer.byteLength(JSON.stringify(index));
console.log(`wxbot index: ${docs.length} docs, ${seeds.length} seeds, ${bytes} bytes`);
