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
const flows = diagrams.filter((name) => ["calling-registration", "certificate-trunk", "registration-trunk", "lgw-media", "app-media", "device-media", "e911-held", "recording-path", "e2ee-path", "flow-designer", "ai-handoff", "migration", "number-port", "nat-sip", "firewall-lanes", "survivability", "wxcc-path", "crm-pop", "identity-sync", "cscan", "pstn-choices", "di-peering", "wfm-loop"].includes(name.replace(/\.svg$/, "")));
if (diagrams.length < 25) throw new Error("need 25 diagrams, have " + diagrams.length);
if (animated.length < 12) throw new Error("need 12 animated flows, have " + animated.length);
if (flows.length < 12) throw new Error("need 12 tagged flows, have " + flows.length);
if (sheets.length < 20) throw new Error("need 20 sheets, have " + sheets.length);
for (const name of sheets) {
  const stem = name.replace(/\.html$/, "");
  if (!existsSync(join(root, "downloads/sheets", stem + ".pdf"))) throw new Error("missing pdf " + stem);
  if (!existsSync(join(root, "downloads/sheets", stem + ".png"))) throw new Error("missing png " + stem);
  const sheet = readFileSync(join(root, "downloads/sheets", name), "utf8");
  for (const bit of ["cyphermonkeylabs.com/#contact", "github.com/CypherMonkeyLabs", "x.com/Cypher0x9", "huggingface.co/Cypher0x9", "linkedin.com/in/luckylakshmanucwebex", "CC BY-NC-SA", "data-canon-footer"]) {
    if (!sheet.includes(bit)) throw new Error(name + " missing " + bit);
  }
}
if (cards.length < 200) throw new Error("need 200 flashcards, have " + cards.length);
const charts = readFileSync(join(root, "charts.html"), "utf8");
const chartCount = (charts.match(/data-chart=/g) || []).length;
if (chartCount < 6) throw new Error("need 6 charts, have " + chartCount);
const home = readFileSync(join(root, "index.html"), "utf8");
for (const bit of ["Diagrams", "Flows", "Charts", "Cheat Codes", "Play", "Ecosystem", "Downloads", "Careers", "data-count", "data-set-theme", "mascot-row", "uni-fold"]) {
  if (!home.includes(bit)) throw new Error("home missing " + bit);
}
for (const id of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"]) {
  const track = readFileSync(join(root, "tracks", id, "index.html"), "utf8");
  if (!track.includes("track-spark") || !track.includes("cube-3d") || !track.includes("data-count")) {
    throw new Error(id + " missing counters");
  }
}
const archive = readFileSync(join(root, "archive/webex-lab-v1/campus/index.html"), "utf8");
for (const bit of ["Diagrams", "Cheat Codes", "Careers", "CC BY-NC-SA"]) {
  if (!archive.includes(bit)) throw new Error("archive missing " + bit);
}
if (cards.some((card) => !card.front || !card.back || !card.source)) throw new Error("empty flashcard");

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
for (const bit of ["github.com/cipher0x9", "x.com/Cypher0x9", "huggingface.co/Cypher0x9", "linkedin.com/in/luckylakshmanucwebex"]) {
  if (!socials.includes(bit)) throw new Error("socials missing " + bit);
}
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
  for (const bit of ["brand-web", "brand-gh", "brand-x", "brand-li", "brand-hf", "cyphermonkeylabs.com/#contact"]) if (!text.includes(bit)) broken.push(file + " footer missing " + bit);
  if (/mailto:|dev\.to|linktr\.ee/i.test(text)) broken.push(file + " red-flag link");
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
console.log("ok", htmlFiles.length, "html", diagrams.length, "diagrams", animated.length, "animated", flows.length, "flows", sheets.length, "sheets", cards.length, "cards", chartCount, "charts");
