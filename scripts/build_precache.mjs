/* Fill the SHELL list in sw.js from files the lab actually serves, under a size budget. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const budget = 3_500_000;
const required = [
  "index.html",
  "offline.html",
  "start.html",
  "help.html",
  "play.html",
  "labs.html",
  "sip-sim.html",
  "ports.html",
  "downloads.html",
  "glossary.html",
  "manifest.webmanifest",
  "favicon.svg",
  "favicon.ico",
  "rooms/T1-R01-control-hub-foundations.html",
  "assets/css/canon.css",
  "assets/css/shell.css",
  "assets/css/frame.css",
  "assets/css/footer.css",
  "assets/css/polish.css",
  "assets/js/frame.js",
  "assets/js/brand.js",
  "assets/js/polish.js",
  "assets/js/shell.js",
  "assets/js/canon.js",
  "assets/js/university.js",
  "assets/js/search-index.js",
  "assets/js/redesign.js",
  "assets/js/study-index.js",
  "assets/js/hero-boot.js",
  "assets/js/theme-boot.js",
  "assets/js/theme-boot-lite.js",
  "assets/js/play.js",
  "assets/js/sip-sim.js",
  "assets/js/phone-nav.js",
  "assets/js/onboard.js",
  "guide/guide.js",
  "guide/guide.css",
  "guide/engine.mjs",
  "guide/wxbot.js",
  "guide/dragbot.js",
  "shared/pybot-chat/engine.js",
  "shared/pybot-chat/ui.js",
  "shared/pybot-chat/chat.css",
  "assets/data/wxbot-index.json",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
];

const chosen = [];
let total = 0;
for (const rel of required) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error("missing precache file", rel);
    process.exit(1);
  }
  const size = fs.statSync(abs).size;
  if (total + size > budget) {
    console.error(`budget exceeded at ${rel}: ${total + size} > ${budget}`);
    process.exit(1);
  }
  chosen.push(rel);
  total += size;
}

const body = ["  \"./\",", ...chosen.map((rel) => `  "./${rel}",`)].join("\n");
const swPath = path.join(root, "sw.js");
let sw = fs.readFileSync(swPath, "utf8");
if (!/var SHELL = \[[\s\S]*?\];/.test(sw)) {
  console.error("SHELL list not found");
  process.exit(1);
}
sw = sw.replace(/var SHELL = \[[\s\S]*?\];/, `var SHELL = [\n${body}\n];`);
sw = sw.replace(/webex-university-v\d+/, "webex-university-v31");
fs.writeFileSync(swPath, sw);
console.log(`precache ${chosen.length + 1} files, ${total} bytes, budget ${budget}`);
