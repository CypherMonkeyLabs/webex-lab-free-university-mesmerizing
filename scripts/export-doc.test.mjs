import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { standaloneDocument, markdownDocument, docxDocument, pptxDocument } from "../assets/js/export-doc.mjs";
import { sourcesHtml, sourcesPlain, assertSources } from "../assets/js/sources-render.mjs";

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

const deeper = sourcesPlain([
  { kind: "rfc", label: "RFC 3261 SIP", href: "https://www.rfc-editor.org/rfc/rfc3261", status: "checked", lastChecked: "2026-10" },
  { kind: "srnd", label: "Vendor SRND or preferred architecture for this topic", status: "confirm" }
]);

test("sources block keeps a checked link and a confirm row with no URL", () => {
  assert.throws(() => assertSources([{ kind: "srnd", label: "missing", status: "confirm", href: "https://example.com" }]));
  const html = sourcesHtml([
    { kind: "rfc", label: "RFC 3261 SIP", href: "https://www.rfc-editor.org/rfc/rfc3261", status: "checked", lastChecked: "2026-10" },
    { kind: "community", label: "Community page for this topic", status: "confirm" }
  ]);
  assert.match(html, /Sources and go deeper/);
  assert.match(html, /last checked 2026-10/);
  assert.match(html, /src-confirm/);
  assert.equal(html.includes("example.com"), false);
  const md = markdownDocument("Queue notes", "Study note.", deeper);
  assert.match(md, /Sources and go deeper/);
  assert.match(md, /confirm/);
  assert.match(md, /rfc3261/);
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
  assert.match(pptxText, /slideMasters\/slideMaster1\.xml/);
  assert.match(pptxText, /ppt\/theme\/theme1\.xml/);
});

test("python-docx and python-pptx open the exports and read the disclaimer", () => {
  const dir = mkdtempSync(join(tmpdir(), "webex-office-"));
  const docxPath = join(dir, "section.docx");
  const pptxPath = join(dir, "section.pptx");
  writeFileSync(docxPath, Buffer.from(docxDocument("Queue notes", "Study note from the room.", deeper)));
  writeFileSync(pptxPath, Buffer.from(pptxDocument("Queue notes", "Study note from the room.", deeper)));
  const script = [
    "from pptx import Presentation",
    "from docx import Document",
    "import sys",
    "doc = Document(sys.argv[1])",
    "text = '\\n'.join(p.text for p in doc.paragraphs)",
    "assert 'learning-only student project' in text, text",
    "assert 'https://cyphermonkeylabs.com/#contact' in text",
    "assert 'https://github.com/CypherMonkeyLabs' in text",
    "assert 'https://linktr.ee/cyphermonkey' in text",
    "assert 'Sources and go deeper' in text",
    "assert 'last checked 2026-10' in text",
    "assert 'confirm' in text",
    "assert 'mailto:' not in text",
    "prs = Presentation(sys.argv[2])",
    "assert len(prs.slides) == 1",
    "assert len(prs.slide_masters) >= 1",
    "assert len(prs.slide_masters[0].slide_layouts) >= 1",
    "names = [str(part.partname) for part in prs.part.package.iter_parts()]",
    "assert any(name.endswith('/theme1.xml') for name in names), names",
    "assert any('slideMaster' in name for name in names), names",
    "slide = '\\n'.join(shape.text_frame.text for shape in prs.slides[0].shapes if shape.has_text_frame)",
    "assert 'learning-only student project' in slide, slide",
    "assert 'Sources and go deeper' in slide",
    "assert 'confirm' in slide",
    "assert 'linktr.ee/cyphermonkey' in slide",
    "print('office-ok')",
  ].join("\n");
  const out = execFileSync("python3", ["-c", script, docxPath, pptxPath], { encoding: "utf8" });
  assert.match(out, /office-ok/);
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
