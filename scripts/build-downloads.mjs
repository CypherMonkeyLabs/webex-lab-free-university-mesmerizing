/* Builds every download the site offers, then assets/data/downloads.json.
   Needs Playwright + Chromium only for PNG/PDF renders (npm i playwright).
   Usage: node scripts/build-downloads.mjs [--no-render]
   Zip: python3 scripts/build_zip.py (run last). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "downloads/diagrams");
const noRender = process.argv.includes("--no-render");
fs.mkdirSync(out, { recursive: true });

const pretty = (s) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const diagrams = [];
for (const f of fs.readdirSync(path.join(root, "assets/diagrams/university")).filter((n) => n.endsWith(".svg")).sort()) {
  diagrams.push({ id: f.replace(/\.svg$/, ""), title: pretty(f.replace(/\.svg$/, "")), src: "assets/diagrams/university/" + f, kind: "Flow diagram" });
}
for (const t of fs.readdirSync(path.join(root, "assets/diagrams")).filter((n) => /^T\d$/.test(n)).sort()) {
  diagrams.push({ id: t + "-mindmap", title: t + " track mind map", src: `assets/diagrams/${t}/mindmap.svg`, kind: "Mind map" });
}

function standaloneSvg(src, title) {
  let s = fs.readFileSync(path.join(root, src), "utf8").replace(/^<\?xml[^>]*\?>\s*/, "");
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(s)) s = s.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  const size = (s.match(/viewBox="0 0 (\d+) (\d+)"/) || [0, 1200, 900]).slice(1).map(Number);
  if (!/<title>/.test(s)) s = s.replace(/(<svg[^>]*>)/, `$1<title>${title}</title>`);
  if (!/ width="/.test(s.match(/<svg[^>]*>/)[0])) s = s.replace("<svg", `<svg width="${size[0]}" height="${size[1]}"`);
  return { svg: '<?xml version="1.0" encoding="UTF-8"?>\n' + s, w: size[0], h: size[1] };
}
function standaloneHtml(d, svg) {
  const inner = svg.replace(/^<\?xml[^>]*\?>\s*/, "").replace(/ width="\d+" height="\d+"/, ' class="art"');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${d.title} | CypherMonkey Labs</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;gap:16px;padding:24px;font-family:system-ui,sans-serif;color:#f8fafc;
background:radial-gradient(60vmax 40vmax at 15% 10%,#7c3aed55,transparent),radial-gradient(50vmax 40vmax at 90% 90%,#06b6d455,transparent),radial-gradient(40vmax 30vmax at 80% 10%,#f472b655,transparent),#0b1020}
h1{margin:0;font-size:clamp(1.2rem,3vw,1.8rem);background:linear-gradient(90deg,#67e8f9,#f0abfc,#fde047);-webkit-background-clip:text;background-clip:text;color:transparent}
.frame{width:min(1100px,100%);border-radius:22px;padding:6px;background:conic-gradient(from 0deg,#22d3ee,#a78bfa,#f472b6,#fde047,#22d3ee);box-shadow:0 0 40px #a78bfa88,0 0 80px #22d3ee44;animation:float 7s ease-in-out infinite}
.frame svg{display:block;width:100%;height:auto;border-radius:17px}
@keyframes float{50%{transform:translateY(-6px)}}
p{margin:0;max-width:60ch;text-align:center;font-size:.85rem;line-height:1.5;color:#e2e8f0}
a{color:#fde047}@media(prefers-reduced-motion:reduce){.frame{animation:none}}
</style></head><body><h1>${d.title}</h1><div class="frame">${inner}</div>
<p>${d.kind} from the CypherMonkey Labs Webex Lab Free University. Independent, free, learning-only student project; trademarks belong to their owners; not affiliated or endorsed. Concerns: <a href="https://cyphermonkeylabs.com/#contact">cyphermonkeylabs.com/#contact</a>. © 2026 CypherMonkeyLabs 🐒</p></body></html>`;
}

const made = [];
for (const d of diagrams) {
  const { svg, w, h } = standaloneSvg(d.src, d.title);
  fs.writeFileSync(path.join(out, d.id + ".svg"), svg);
  fs.writeFileSync(path.join(out, d.id + ".html"), standaloneHtml(d, svg));
  made.push({ ...d, w, h });
}

let pw = null;
if (!noRender) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  for (const d of made) {
    const page = await browser.newPage({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: 1.5 });
    await page.goto("file://" + path.join(out, d.id + ".svg"));
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(out, d.id + ".png") });
    await page.close();
  }
  const sheets = path.join(root, "downloads/sheets");
  for (const f of fs.readdirSync(sheets).filter((n) => n.endsWith(".html"))) {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
    await page.goto("file://" + path.join(sheets, f));
    await page.pdf({ path: path.join(sheets, f.replace(/html$/, "pdf")), format: "A4", printBackground: true, margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" } });
    await page.screenshot({ path: path.join(sheets, f.replace(/html$/, "png")), fullPage: true });
    await page.close();
  }
  const page = await browser.newPage();
  await page.goto("file://" + path.join(root, "downloads/flashcards-print.html"));
  await page.pdf({ path: path.join(root, "downloads/flashcards-print.pdf"), format: "A4", printBackground: true });
  await browser.close();
}

const size = (rel) => fs.statSync(path.join(root, rel)).size;
const file = (kind, rel) => ({ kind, href: rel, bytes: size(rel) });
const groups = [];
groups.push({ id: "bundle", title: "Everything in one zip", items: [{ label: "Download everything", blurb: "The whole site: rooms, diagrams, sheets, cards, audio, and downloads. Free for anyone to keep offline.", files: [file("ZIP", "downloads/webex-university-offline.zip")] }] });
groups.push({ id: "deck", title: "Flashcards", items: [{ label: "Flashcard deck", blurb: "842 cards from the rooms. Pick the format you like.", files: [file("PDF", "downloads/flashcards-print.pdf"), file("JSON", "downloads/flashcards.json"), file("HTML", "downloads/flashcards-print.html")] }] });
const sheetItems = fs.readdirSync(path.join(root, "downloads/sheets")).filter((n) => n.endsWith(".pdf")).sort().map((n) => {
  const id = n.replace(/\.pdf$/, "");
  return { label: pretty(id), blurb: "One-page cheat sheet.", files: ["pdf", "html", "png", "svg"].map((e) => file(e.toUpperCase(), `downloads/sheets/${id}.${e}`)) };
});
groups.push({ id: "sheets", title: "Cheat sheets (PDF first)", items: sheetItems });
for (const [kind, title] of [["Flow diagram", "Flow diagrams (SVG, PNG, standalone HTML)"], ["Mind map", "Track mind maps (SVG, PNG, standalone HTML)"]]) {
  groups.push({ id: kind === "Mind map" ? "mindmaps" : "diagrams", title, items: made.filter((d) => d.kind === kind).map((d) => ({ label: d.title, blurb: kind + " with its colors and motion kept inside the file.", files: ["svg", "png", "html"].map((e) => file(e.toUpperCase(), `downloads/diagrams/${d.id}.${e}`)) })) });
}
fs.writeFileSync(path.join(root, "assets/data/downloads.json"), JSON.stringify({ groups }, null, 1) + "\n");
console.log("downloads.json written:", groups.map((g) => g.id + ":" + g.items.length).join(" "));
