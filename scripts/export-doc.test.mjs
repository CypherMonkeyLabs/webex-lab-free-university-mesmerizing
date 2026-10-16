import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { standaloneDocument, markdownDocument, docxDocument, pptxDocument } from "../assets/js/export-doc.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const need = [
  "learning-only student project",
  "not affiliated with or endorsed by",
  "© 2026 CypherMonkeyLabs",
  "https://cyphermonkeylabs.com/#contact",
  "https://github.com/CypherMonkeyLabs",
  "https://linktr.ee/cyphermonkey",
  "data-canon-footer"
];

test("standalone html carries the disclaimer and the three brand links", () => {
  const html = standaloneDocument("Queue notes", "<h1>Queue</h1><p>Study note.</p>");
  for (const bit of need) assert.ok(html.includes(bit), bit);
  assert.equal(html.includes("mailto:"), false);
  assert.equal(/x\.com\/|linkedin\.com|huggingface\.co/.test(html), false);
});

test("markdown export names the contact page", () => {
  const md = markdownDocument("Sheet", "One fact from the page.");
  assert.match(md, /cyphermonkeylabs.com\/#contact/);
  assert.match(md, /github.com\/CypherMonkeyLabs/);
  assert.match(md, /linktr.ee\/cyphermonkey/);
});

test("docx and pptx section exports keep the disclaimer in the package", () => {
  const docx = Buffer.from(docxDocument("Queue notes", "Study note from the room."));
  const pptx = Buffer.from(pptxDocument("Queue notes", "Study note from the room."));
  const docxText = docx.toString("utf8");
  const pptxText = pptx.toString("utf8");
  assert.match(docxText, /word\/document\.xml/);
  assert.match(docxText, /learning-only student project/);
  assert.match(docxText, /cyphermonkeylabs.com\/#contact/);
  assert.match(docxText, /linktr.ee\/cyphermonkey/);
  assert.match(pptxText, /ppt\/slides\/slide1\.xml/);
  assert.match(pptxText, /learning-only student project/);
  assert.equal(docxText.includes("mailto:"), false);
  assert.equal(pptxText.includes("mailto:"), false);
});

test("new study drawings animate and their standalone pages keep the footer", () => {
  const dir = join(root, "assets/diagrams/university");
  const stems = ["queue-routing", "cucm-bridge", "meetings-media"];
  const rows = [];
  for (const stem of stems) {
    const svg = readFileSync(join(dir, stem + ".svg"), "utf8");
    const page = readFileSync(join(root, "downloads/diagrams", stem + ".html"), "utf8");
    const svgOk = svg.includes("animateMotion") && svg.includes("Study drawing");
    const pageOk = page.includes("data-canon-footer") && page.includes("learning-only student project");
    rows.push({ file: stem, svg: svgOk ? "pass" : "fail", html: pageOk ? "pass" : "fail" });
    assert.equal(svgOk, true, stem + " svg");
    assert.equal(pageOk, true, stem + " html");
  }
  const all = readdirSync(dir).filter((name) => name.endsWith(".svg"));
  console.log("\n| export | svg animateMotion | standalone footer |");
  console.log("| --- | --- | --- |");
  for (const row of rows) console.log("| " + row.file + " | " + row.svg + " | " + row.html + " |");
  console.log("| atlas count | " + all.length + " svg files | see diagrams.html |");
});
