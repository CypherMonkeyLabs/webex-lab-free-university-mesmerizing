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
];
const missing = need.filter((path) => !existsSync(join(root, path)));
if (missing.length) {
  console.error("missing", missing);
  process.exit(1);
}

const diagrams = readdirSync(join(root, "assets/diagrams/university")).filter((name) => name.endsWith(".svg"));
const sheets = readdirSync(join(root, "downloads/sheets")).filter((name) => name.endsWith(".html"));
const cards = JSON.parse(readFileSync(join(root, "downloads/flashcards.json"), "utf8")).cards;
if (diagrams.length < 24) throw new Error("need 24 diagrams, have " + diagrams.length);
if (sheets.length < 12) throw new Error("need 12 sheets, have " + sheets.length);
if (cards.length < 30) throw new Error("need 30 flashcards, have " + cards.length);
if (cards.some((card) => !card.front || !card.back || !card.source)) throw new Error("empty flashcard");

const uni = readFileSync(join(root, "assets/js/university.js"), "utf8");
for (const bit of ["cyphermonkeylabs.com", "linktr.ee/cyphermonkey", "dev.to/cyphermonkey", "huggingface.co/Cypher0x9", "x.com/Cypher0x9", "CC BY-NC-SA", "Report a concern"]) {
  if (!uni.includes(bit)) throw new Error("chrome missing " + bit);
}
if (/linkedin/i.test(uni)) throw new Error("linkedin in chrome");
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

const htmlFiles = walk(root, []);
const broken = [];
const hrefRe = /(?:href|src)="([^"]+)"/g;
for (const file of htmlFiles) {
  const text = readFileSync(file, "utf8");
  if (/linkedin\.com/i.test(text)) broken.push(file + " linkedin");
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
console.log("ok", htmlFiles.length, "html", diagrams.length, "diagrams", sheets.length, "sheets", cards.length, "cards");
