import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const need = [
  "index.html",
  "mastery.html",
  "ports.html",
  "play.html",
  "downloads.html",
  "ecosystem-atlas.html",
  "ecosystem.html",
  "assets/js/university.js",
  "assets/css/university.css",
  "sw.js",
  "downloads/flashcards.json",
  "downloads/flashcards-print.html",
  "downloads/cache-manifest.json",
  "archive/webex-lab-v1/campus/index.html",
  "diagrams.html",
  "flows.html",
  "charts.html",
  "careers.html",
  "vendor/anime.esm.min.js",
  "vendor/d3.min.js",
  "vendor/rough.esm.js",
  "vendor/confetti.browser.js",
  "vendor/markmap-view.js",
  "vendor/three.module.min.js",
  "assets/js/effects.js",
];
const missing = need.filter((path) => !existsSync(join(root, path)));
if (missing.length) {
  console.error("missing", missing);
  process.exit(1);
}

const diagrams = readdirSync(join(root, "assets/diagrams/university")).filter((name) => name.endsWith(".svg"));
const sheets = readdirSync(join(root, "downloads/sheets")).filter((name) => name.endsWith(".html"));
const cards = JSON.parse(readFileSync(join(root, "downloads/flashcards.json"), "utf8")).cards;
const animated = diagrams.filter((name) => readFileSync(join(root, "assets/diagrams/university", name), "utf8").includes("animateMotion"));
const flows = diagrams.filter((name) => ["calling-registration", "certificate-trunk", "registration-trunk", "lgw-media", "app-media", "device-media", "e911-held", "recording-path", "e2ee-path", "flow-designer", "ai-handoff", "migration", "number-port", "nat-sip", "firewall-lanes", "survivability", "wxcc-path", "crm-pop", "identity-sync", "cscan", "pstn-choices", "di-peering", "wfm-loop", "queue-routing", "agent-state", "wxcc-callback", "wxcc-ivr", "wxcc-recording", "wxcce-bridge", "cucm-bridge", "dial-plan", "location-gateway", "voicemail-path", "hunt-group", "call-queue", "consult-transfer", "contact-entry", "barge-path", "callback-offer"].includes(name.replace(/\.svg$/, "")));
if (diagrams.length < 25) throw new Error("need 25 diagrams, have " + diagrams.length);
if (animated.length < 12) throw new Error("need 12 animated flows, have " + animated.length);
if (flows.length < 12) throw new Error("need 12 tagged flows, have " + flows.length);
if (sheets.length < 20) throw new Error("need 20 sheets, have " + sheets.length);
for (const name of sheets) {
  const stem = name.replace(/\.html$/, "");
  if (!existsSync(join(root, "downloads/sheets", stem + ".pdf"))) throw new Error("missing pdf " + stem);
  if (!existsSync(join(root, "downloads/sheets", stem + ".png"))) throw new Error("missing png " + stem);
  const sheet = readFileSync(join(root, "downloads/sheets", name), "utf8");
  for (const bit of ["cyphermonkeylabs.com/#contact", "github.com/CypherMonkeyLabs", "linktr.ee/cyphermonkey", "CC BY-NC-SA", "data-canon-footer"]) {
    if (!sheet.includes(bit)) throw new Error(name + " missing " + bit);
  }
  if (/x\.com\/Cypher|linkedin\.com\/in\/lucky|huggingface\.co\/Cypher|github\.com\/cipher0x9/.test(sheet)) throw new Error(name + " social brand link");
}
if (cards.length < 200) throw new Error("need 200 flashcards, have " + cards.length);
const charts = readFileSync(join(root, "charts.html"), "utf8");
const chartCount = (charts.match(/data-chart=/g) || []).length;
if (chartCount < 6) throw new Error("need 6 charts, have " + chartCount);
const home = readFileSync(join(root, "index.html"), "utf8");
for (const bit of ["Diagrams", "Flows", "Charts", "Cheat Codes", "Play", "Ecosystem", "Downloads", "Careers", "data-count", "data-set-theme", "mascot-row", "uni-fold"]) {
  if (!home.includes(bit)) throw new Error("home missing " + bit);
}
for (const id of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"]) {
  const track = readFileSync(join(root, "tracks", id, "index.html"), "utf8");
  if (!track.includes("track-spark") || !track.includes("cube-3d") || !track.includes("data-count")) {
    throw new Error(id + " missing counters");
  }
}
const roomFiles = readdirSync(join(root, "rooms")).filter((name) => name.endsWith(".html"));
const roomCount = roomFiles.length;
const spelled = { 63: "Sixty-three", 78: "Seventy-eight" };
const words = spelled[roomCount];
if (!words) throw new Error("spell the room count " + roomCount + " in the hero, meta, and README");
const canon = JSON.parse(readFileSync(join(root, "assets/js/search-index.js"), "utf8").replace(/^window\.CANON_INDEX\s*=\s*/, "").replace(/;\s*$/, ""));
const indexed = canon.tracks.reduce((sum, track) => sum + track.rooms.length, 0);
if (indexed !== roomCount) throw new Error("search index has " + indexed + " rooms, files have " + roomCount);
const listed = (home.match(/data-code="/g) || []).length;
if (listed !== roomCount) throw new Error("home lists " + listed + " rooms, files have " + roomCount);
const tileSum = [...home.matchAll(/<p>(\d+) rooms/g)].reduce((sum, match) => sum + Number(match[1]), 0);
if (tileSum !== roomCount) throw new Error("track tiles sum to " + tileSum + ", files have " + roomCount);
for (const bit of [words + " rooms", 'data-count="' + roomCount + '">' + roomCount + "</b> rooms", "written rooms of " + roomCount]) {
  if (!home.includes(bit)) throw new Error("home missing " + bit);
}
if (/data-count="\d+">0</.test(home)) throw new Error("home counter still starts at 0");
const description = (home.match(/name="description" content="([^"]*)"/) || [])[1] || "";
const og = (home.match(/property="og:description" content="([^"]*)"/) || [])[1] || "";
if (!description.includes(words) || !og.includes(words)) throw new Error("meta room count");
if (!readFileSync(join(root, "manifest.webmanifest"), "utf8").includes(words)) throw new Error("manifest room count");
if (!readFileSync(join(root, "README.md"), "utf8").includes(roomCount + " rooms")) throw new Error("README room count");
const kb = JSON.parse(readFileSync(join(root, "guide/kb/index.json"), "utf8"));
if (kb.counts.rooms !== roomCount || kb.counts.lessons !== roomCount) throw new Error("guide kb room count");
const guideData = readFileSync(join(root, "assets/data/guide-kb.json"), "utf8");
if (!guideData.includes(words) || !guideData.includes(roomCount + " rooms")) throw new Error("guide data room count");
const chartJson = JSON.parse((charts.match(/<script type="application\/json" id="chart-data">([\s\S]*?)<\/script>/) || [, "{}"])[1]);
const chartRooms = (chartJson.tracks || []).reduce((sum, track) => sum + track.rooms, 0);
if (chartRooms !== roomCount) throw new Error("charts sum to " + chartRooms);
if (readFileSync(join(root, "assets/js/redesign.js"), "utf8").includes("Math.pow(1 - t, 3)")) {
  throw new Error("room counter still counts up through a false total");
}
for (const file of ["assets/js/wow.js", "assets/js/frame.js", "assets/js/phone-nav.js", "assets/js/shell.js", "assets/js/guide-kb.js", "play.html", "ecosystem.html", "audio/scripts/how-to-use.md", "archive/webex-lab-v1/campus/index.html"]) {
  const text = readFileSync(join(root, file), "utf8");
  if (!text.includes(String(roomCount)) && !text.toLowerCase().includes(words.toLowerCase())) throw new Error(file + " room count");
}
if (!readFileSync(join(root, "assets/js/university.js"), "utf8").includes("opened >= " + roomCount)) throw new Error("all-rooms badge threshold");
for (const id of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"]) {
  const track = readFileSync(join(root, "tracks", id, "index.html"), "utf8");
  const local = canon.tracks.find((item) => item.id === id).rooms.length;
  if (!track.includes('data-count="' + roomCount + '">' + roomCount + "</b>")) throw new Error(id + " Canon room counter");
  if (!track.includes('data-count="' + local + '">' + local + "</b>")) throw new Error(id + " track room counter");
  if (/data-count="\d+">0</.test(track)) throw new Error(id + " counter still starts at 0");
}
const archive = readFileSync(join(root, "archive/webex-lab-v1/campus/index.html"), "utf8");
for (const bit of ["Diagrams", "Cheat Codes", "Careers", "CC BY-NC-SA"]) {
  if (!archive.includes(bit)) throw new Error("archive missing " + bit);
}
if (cards.some((card) => !card.front || !card.back || !card.source)) throw new Error("empty flashcard");
function walkArchive(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === "vendor" || name === "node_modules") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walkArchive(path, out);
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}
const archiveHtml = walkArchive(join(root, "archive"), []);
for (const file of archiveHtml) {
  const text = readFileSync(file, "utf8");
  if (/https:\/\/x\.com|huggingface\.co|linkedin\.com|github\.com\/cipher0x9|dev\.to/i.test(text)) {
    throw new Error("archive brand link " + file);
  }
}
for (const bit of ["https://cyphermonkeylabs.com", "https://github.com/CypherMonkeyLabs", "https://linktr.ee/cyphermonkey"]) {
  if (!archive.includes(bit)) throw new Error("archive missing " + bit);
}

const uni = readFileSync(join(root, "assets/js/university.js"), "utf8");
for (const bit of ["cyphermonkeylabs.com", "CC BY-NC-SA", "Report a concern", "guide-mount"]) {
  if (!uni.includes(bit)) throw new Error("chrome missing " + bit);
}
if (/dev\.to\/cyphermonkey/.test(uni)) throw new Error("dev.to still in chrome");
const frameJs = readFileSync(join(root, "assets/js/frame.js"), "utf8");
if (!frameJs.includes("A student's open lab: learning and sharing, free for everyone.")) throw new Error("identity line");
if (!frameJs.includes("guide-mount")) throw new Error("guide mount");
if (!readFileSync(join(root, "assets/css/shell.css"), "utf8").includes('data-theme="contrast"')) throw new Error("contrast theme");
const socials = readFileSync(join(root, "assets/data/socials.json"), "utf8");
for (const bit of ["cyphermonkeylabs.com", "github.com/CypherMonkeyLabs", "linktr.ee/cyphermonkey"]) {
  if (!socials.includes(bit)) throw new Error("socials missing " + bit);
}
if (/x\.com\/|linkedin\.com|huggingface\.co|cipher0x9/.test(socials)) throw new Error("socials still lists a removed network");
if (/@/.test(uni.match(/mailto:[^"']+/) || "")) throw new Error("email in chrome");

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === ".git" || name === "node_modules" || name === "archive") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out);
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

const htmlFiles = walk(root, []).filter((f) => !f.includes("/downloads/diagrams/"));
if (htmlFiles.length < 119) throw new Error("expected 119 pages, found " + htmlFiles.length);
// The only Linktree URL allowed anywhere is the About icon.
for (const f of ["assets/js/polish.js", "assets/js/university.js", "assets/js/frame.js", "assets/js/phone-nav.js"]) {
  const t = readFileSync(join(root, f), "utf8");
  for (const m of t.match(/linktr\.ee[^"\\\s]*/g) || []) if (m !== "linktr.ee/cyphermonkey") throw new Error("linktree url " + m);
  if (/dev\.to/.test(t)) throw new Error("dev.to in " + f);
}
const broken = [];
const hrefRe = /(?:href|src)="([^"]+)"/g;
for (const file of htmlFiles) {
  const text = readFileSync(file, "utf8");
  // Round 3 rules: disclaimer + brand icons on every page, red-flag scan.
  if (!text.includes("data-canon-footer") || !text.includes("learning-only student project") || !text.includes("© 2026 CypherMonkeyLabs 🐒")) broken.push(file + " footer/disclaimer missing");
  for (const bit of ["brand-web", "brand-gh", "brand-lt", "cyphermonkeylabs.com/#contact"]) if (!text.includes(bit)) broken.push(file + " footer missing " + bit);
  if (/mailto:|dev\.to/i.test(text)) broken.push(file + " red-flag link");
  for (const hit of text.match(/linktr\.ee[^"'\s]*/g) || []) if (hit !== "linktr.ee/cyphermonkey") broken.push(file + " linktree " + hit);
  if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/.test(text.replace(/<script[\s\S]*?<\/script>/g, ""))) broken.push(file + " email-shaped text");
  if (/class="lab-links"/.test(text)) broken.push(file + " utility strip");
  let match;
  while ((match = hrefRe.exec(text))) {
    const href = match[1];
    if (!href || href.startsWith("#") || href.startsWith("http:") || href.startsWith("https:") || href.startsWith("mailto:") || href.startsWith("data:")) continue;
    if (href.startsWith("/")) {
      broken.push(file + " absolute " + href);
      continue;
    }
    const clean = href.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = resolve(dirname(file), clean);
    if (!existsSync(target)) broken.push(file + " -> " + href);
  }
}
if (broken.length) {
  console.error(broken.slice(0, 40).join("\n"));
  console.error("broken", broken.length);
  process.exit(1);
}

function allowedBrand(href) {
  let url;
  try { url = new URL(href); } catch { return true; }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "cyphermonkeylabs.com") return true;
  if (host === "github.com" && (url.pathname === "/CypherMonkeyLabs" || url.pathname.startsWith("/CypherMonkeyLabs/"))) return true;
  if (host === "linktr.ee" && url.pathname.replace(/\/$/, "") === "/cyphermonkey") return true;
  if (host === "127.0.0.1" || host === "localhost") return true;
  return false;
}
function urlsIn(text) {
  return text.match(/https?:\/\/[^"'\s<>)]+/g) || [];
}
const brandProblems = [];
for (const file of htmlFiles) {
  const text = readFileSync(file, "utf8");
  const chrome = text.replace(/<main[\s\S]*?<\/main>/gi, "").replace(/<article[\s\S]*?<\/article>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const href of urlsIn(chrome)) if (!allowedBrand(href)) brandProblems.push(file + " chrome " + href);
}
for (const file of ["README.md", "assets/js/frame.js", "assets/js/polish.js", "assets/js/university.js", "assets/js/phone-nav.js", "assets/js/brand.js", "assets/js/onboard.js", "assets/js/studio.js", "assets/data/socials.json", "embed/widget.js"]) {
  const text = readFileSync(join(root, file), "utf8");
  for (const href of urlsIn(text)) if (!allowedBrand(href)) brandProblems.push(file + " " + href);
}
if (brandProblems.length) {
  console.error(brandProblems.slice(0, 30).join("\n"));
  throw new Error("brand hosts " + brandProblems.length);
}
const sourceGaps = [];
for (const file of readdirSync(join(root, "rooms")).filter((name) => name.endsWith(".html"))) {
  const html = readFileSync(join(root, "rooms", file), "utf8");
  const id = (html.match(/data-room="([^"]+)"/) || [0, ""])[1];
  if (!html.includes("Sources and go deeper")) sourceGaps.push(file + " missing sources block");
  const jsonPath = join(root, "rooms/sources", id, "sources.json");
  if (!existsSync(jsonPath)) sourceGaps.push(file + " missing sources.json");
  else {
    const doc = JSON.parse(readFileSync(jsonPath, "utf8"));
    for (const item of doc.items || []) {
      if (item.status === "confirm" && item.href) sourceGaps.push(id + " confirm has URL");
      if (item.status === "checked" && (!item.href || !/^\d{4}-\d{2}$/.test(item.lastChecked || ""))) sourceGaps.push(id + " checked row incomplete");
    }
  }
}
for (const file of ["downloads/flashcards-print.html", "flashcards.html"]) {
  if (!readFileSync(join(root, file), "utf8").includes("Sources and go deeper")) sourceGaps.push(file + " missing sources block");
}
for (const name of readdirSync(join(root, "downloads/sheets"))) {
  if (!/\.(html|svg|md)$/.test(name)) continue;
  if (!readFileSync(join(root, "downloads/sheets", name), "utf8").includes("Sources and go deeper")) sourceGaps.push("sheet " + name);
}
for (const track of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"]) {
  const chapter = readFileSync(join(root, "tracks", track, "chapter.md"), "utf8");
  if (!chapter.includes("Sources and go deeper") || !chapter.includes("last checked")) sourceGaps.push(track + " chapter.md");
}
if (!readFileSync(join(root, "downloads.html"), "utf8").includes("Sources and go deeper")) sourceGaps.push("downloads.html");
for (const name of readdirSync(join(root, "downloads/diagrams")).filter((item) => item.endsWith(".svg"))) {
  const svg = readFileSync(join(root, "downloads/diagrams", name), "utf8");
  if (!svg.includes("Sources and go deeper") || !svg.includes("last checked")) sourceGaps.push("diagram svg " + name);
  if (/status="confirm"[^>]*href=|href="https?:[^"]*"[^>]*>[^<]*confirm/.test(svg)) sourceGaps.push("diagram confirm url " + name);
}
if (sourceGaps.length) {
  console.error(sourceGaps.slice(0, 20).join("\n"));
  throw new Error("sources " + sourceGaps.length);
}
console.log("ok", htmlFiles.length, "html", diagrams.length, "diagrams", animated.length, "animated", flows.length, "flows", sheets.length, "sheets", cards.length, "cards", chartCount, "charts");
