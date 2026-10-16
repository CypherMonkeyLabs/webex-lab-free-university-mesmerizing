/* Open every candidate URL. Checked rows keep the URL and a YYYY-MM date.
   Anything that does not open becomes a confirm row with no URL.
   Writes rooms/sources/<id>/sources.json, track and sheet copies, and stamps HTML, Markdown, and the card deck.
   Usage: node scripts/build-sources.mjs [--no-pdf] */
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docxDocument, markdownDocument, pptxDocument } from "../assets/js/export-doc.mjs";
import { kindLabel, sourcesHtml, sourcesMarkdown, sourcesPlain } from "../assets/js/sources-render.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LAST = "2026-10";
const noPdf = process.argv.includes("--no-pdf");
const pdfOnly = process.argv.includes("--pdf-only");
const fromLog = process.argv.includes("--from-log") || pdfOnly;
const KINDS = ["rfc", "vendor", "ports", "community", "wikipedia", "srnd", "devdocs", "release"];
const CONFIRM = {
  rfc: "RFC or other standards-body document for this topic",
  vendor: "Vendor documentation for this topic",
  ports: "Protocol and port table for this topic",
  community: "Community page for this topic",
  wikipedia: "Wikipedia page for this topic",
  srnd: "Vendor SRND or preferred architecture for this topic",
  devdocs: "Vendor developer documentation for this topic",
  release: "Official release notes for this topic"
};

const CATALOG = [
  { id: "rfc3261", kind: "rfc", label: "RFC 3261 SIP: Session Initiation Protocol", href: "https://www.rfc-editor.org/rfc/rfc3261" },
  { id: "rfc3263", kind: "rfc", label: "RFC 3263 Locating SIP Servers", href: "https://www.rfc-editor.org/rfc/rfc3263" },
  { id: "rfc3264", kind: "rfc", label: "RFC 3264 An Offer/Answer Model with SDP", href: "https://www.rfc-editor.org/rfc/rfc3264" },
  { id: "rfc3550", kind: "rfc", label: "RFC 3550 RTP", href: "https://www.rfc-editor.org/rfc/rfc3550" },
  { id: "rfc3711", kind: "rfc", label: "RFC 3711 SRTP", href: "https://www.rfc-editor.org/rfc/rfc3711" },
  { id: "rfc4566", kind: "rfc", label: "RFC 4566 SDP", href: "https://www.rfc-editor.org/rfc/rfc4566" },
  { id: "rfc4733", kind: "rfc", label: "RFC 4733 RTP payload for DTMF", href: "https://www.rfc-editor.org/rfc/rfc4733" },
  { id: "rfc8446", kind: "rfc", label: "RFC 8446 TLS 1.3", href: "https://www.rfc-editor.org/rfc/rfc8446" },
  { id: "iana", kind: "ports", label: "IANA service name and port number registry", href: "https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml" },
  { id: "wiki-sip", kind: "wikipedia", label: "Session Initiation Protocol (Wikipedia)", href: "https://en.wikipedia.org/wiki/Session_Initiation_Protocol" },
  { id: "wiki-webex", kind: "wikipedia", label: "Webex (Wikipedia)", href: "https://en.wikipedia.org/wiki/Webex" },
  { id: "wiki-cucm", kind: "wikipedia", label: "Cisco Unified Communications Manager (Wikipedia)", href: "https://en.wikipedia.org/wiki/Cisco_Unified_Communications_Manager" },
  { id: "wiki-rtp", kind: "wikipedia", label: "Real-time Transport Protocol (Wikipedia)", href: "https://en.wikipedia.org/wiki/Real-time_Transport_Protocol" },
  { id: "wiki-cc", kind: "wikipedia", label: "Call centre (Wikipedia)", href: "https://en.wikipedia.org/wiki/Call_centre" },
  { id: "wiki-ivr", kind: "wikipedia", label: "Interactive voice response (Wikipedia)", href: "https://en.wikipedia.org/wiki/Interactive_voice_response" },
  { id: "help-home", kind: "vendor", label: "Webex Help Center", href: "https://help.webex.com/" },
  { id: "dev-webex", kind: "devdocs", label: "Webex developer documentation", href: "https://developer.webex.com/" },
  { id: "dev-start", kind: "devdocs", label: "Webex developer getting started", href: "https://developer.webex.com/docs/getting-started" },
  { id: "community-webex", kind: "community", label: "Webex community", href: "https://help.webex.com/community" },
  { id: "community-cisco", kind: "community", label: "Cisco Community", href: "https://community.cisco.com/" },
  { id: "design-zone", kind: "srnd", label: "Cisco Collaboration design zone", href: "https://www.cisco.com/c/en/us/solutions/enterprise/design-zone-collaboration/index.html" },
  { id: "pa-calling", kind: "srnd", label: "Cisco Preferred Architecture for Webex Calling", href: "https://www.cisco.com/c/en/us/td/docs/solutions/PA/webex-calling/Webex-Calling-PA.html" },
  { id: "release-calling", kind: "release", label: "What's new in Webex Calling", href: "https://help.webex.com/article/278bz2" },
  { id: "release-wxcc", kind: "release", label: "What's new for administrators in Webex Contact Center", href: "https://help.webex.com/article/nv7abhz" },
  { id: "ports-b2exve", kind: "ports", label: "Port reference for Webex Calling", href: "https://help.webex.com/article/b2exve" }
];

const PACKS = {
  webex: ["wiki-webex", "help-home", "dev-webex", "dev-start", "community-webex", "community-cisco", "design-zone", "rfc3261", "iana", "ports-b2exve"],
  sip: ["rfc3261", "rfc3263", "rfc3264", "wiki-sip", "iana"],
  rtp: ["rfc3550", "rfc3711", "rfc4566", "rfc4733", "wiki-rtp", "iana", "ports-b2exve"],
  tls: ["rfc8446"],
  cucm: ["wiki-cucm", "design-zone", "pa-calling"],
  cc: ["wiki-cc", "wiki-ivr"],
  releaseCalling: ["release-calling"],
  releaseWxcc: ["release-wxcc"]
};

const SHEETS = {
  "ports-protocols": ["T2-R06", "T7-R01", "T7-R03"],
  "dial-plan": ["T2-R03"],
  "pstn-byoc": ["T2-R02"],
  "devices-provisioning": ["T2-R04"],
  "control-hub-roles": ["T1-R01", "T1-R05"],
  "identity-sync": ["T1-R02"],
  "licensing-certs": ["T1-R03"],
  "dedicated-instance": ["T5-R01"],
  "migration-cutover": ["T6-R01", "T6-R02"],
  "number-porting": ["T6-R06"],
  "media-nat": ["T7-R03"],
  survivability: ["T2-R07"],
  security: ["T2-R06", "T1-R07"],
  e911: ["T2-R06"],
  "flow-designer": ["T8-R01"],
  "crm-apis": ["T8-R03", "T8-R04"],
  "wxcc-routing": ["T3-R03", "T7-R05"],
  "analyzer-reports": ["T3-R07"],
  troubleshooting: ["T8-R06", "T8-R07"],
  wfm: ["T3-R09"],
  "recording-qm": ["T2-R06", "T3-R09"],
  "ai-agents": ["T8-R05"],
  "call-flows": ["T2-R01", "T4-R03"],
  "careers-certs": ["T1-R03"],
  "config-checklist": ["T2-R01"],
  glossary: ["T1-R01"]
};

function packsFor(id) {
  const track = id.slice(0, 2);
  const packs = ["webex"];
  if (track === "T2" || track === "T7" || track === "T6") packs.push("sip", "rtp", "releaseCalling");
  if (track === "T1") packs.push("releaseCalling");
  if (id === "T2-R06" || id === "T1-R07" || id === "T7-R03") packs.push("tls");
  if (track === "T4" || track === "T5" || track === "T6") packs.push("cucm");
  if (track === "T5") packs.push("releaseCalling");
  if (track === "T3" || track === "T4" || track === "T8") packs.push("cc", "releaseWxcc");
  if (track === "T8") packs.push("sip");
  return packs;
}

function roomFiles() {
  return readdirSync(join(root, "rooms")).filter((name) => name.endsWith(".html")).sort();
}

function roomIdFrom(file, html) {
  const marked = html.match(/data-room="([^"]+)"/);
  if (marked) return marked[1];
  return file.slice(0, 6);
}

async function openUrl(url) {
  const ctrl = AbortSignal.timeout(20000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl,
      headers: { "user-agent": "Mozilla/5.0 (compatible; CypherMonkeyLabs-source-check/1.0)" }
    });
    return { ok: res.status >= 200 && res.status < 400, status: res.status, final: res.url };
  } catch (error) {
    return { ok: false, status: 0, error: String(error && error.message || error) };
  }
}

async function pool(items, limit, worker) {
  const out = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      out[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return out;
}

function citeLinks(html) {
  const start = html.indexOf('id="cites"');
  if (start < 0) return [];
  const chunk = html.slice(start, html.indexOf("</section>", start));
  const found = [];
  const re = /<a href="(https?:\/\/[^"]+)">([^<]*)<\/a>/g;
  let match;
  while ((match = re.exec(chunk))) found.push({ href: match[1], label: match[2].replace(/\s+/g, " ").trim() });
  return found;
}

function withConfirms(items) {
  const have = new Set(items.filter((item) => item.status === "checked").map((item) => item.kind));
  const out = items.slice();
  KINDS.forEach((kind) => {
    if (have.has(kind)) return;
    out.push({ kind, label: CONFIRM[kind], status: "confirm" });
  });
  return out;
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  items.forEach((item) => {
    const key = item.href || ("confirm:" + item.kind + ":" + item.label);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });
  return out;
}

function record(id, title, items) {
  return {
    id,
    title,
    checked: LAST,
    items: withConfirms(dedupe(items))
  };
}

function stripBlock(html) {
  return html
    .replace(/<article>\s*<section id="go-deeper"[\s\S]*?<\/section>\s*<\/article>\n?/g, "")
    .replace(/<section id="go-deeper"[\s\S]*?<\/section>\n?/g, "");
}

function insert(html, marker, block) {
  const idx = html.lastIndexOf(marker);
  if (idx < 0) throw new Error("missing " + marker);
  return html.slice(0, idx) + block + "\n" + html.slice(idx);
}

function stampRoom(html, block) {
  let next = stripBlock(html);
  if (!next.includes('href="#go-deeper"') && next.includes('class="toc"')) {
    next = next.replace("</ol></nav>", '<li><a href="#go-deeper"><span class="n">+</span>Sources</a></li></ol></nav>');
  }
  const marker = next.includes('class="room-pager"') ? '<nav class="room-pager"' : "</article>";
  return insert(next, marker, block);
}

function stampBefore(html, marker, block, wrapArticle) {
  const next = stripBlock(html);
  const body = wrapArticle ? "<article>\n" + block + "\n</article>\n" : block + "\n";
  return insert(next, marker, body);
}

function writeJson(path, doc) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
}

function killGroup(child) {
  try { process.kill(-child.pid, "SIGKILL"); } catch { try { child.kill("SIGKILL"); } catch { /* already gone */ } }
}

function chromeFile(htmlPath, outPath, extraArgs, readyNeedle, timeoutMs) {
  const dir = "/tmp/pdf-chrome-" + process.pid + "-" + Math.random().toString(16).slice(2);
  return new Promise((resolve, reject) => {
    const child = spawn("google-chrome", [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=0",
      "--user-data-dir=" + dir,
      ...extraArgs,
      "file://" + htmlPath
    ], { stdio: ["ignore", "pipe", "pipe"], detached: true });
    let buf = "";
    let settled = false;
    const finish = (error, size) => {
      if (settled) return;
      settled = true;
      clearInterval(timer);
      killGroup(child);
      rmSync(dir, { recursive: true, force: true });
      if (error) reject(error);
      else resolve(size);
    };
    const started = Date.now();
    const timer = setInterval(() => {
      if (buf.includes(readyNeedle)) {
        let size = 0;
        try { size = statSync(outPath).size; } catch { size = 0; }
        if (size > 1000) finish(null, size);
      }
      if (Date.now() - started > timeoutMs) finish(new Error("chrome timeout " + outPath));
    }, 400);
    const take = (chunk) => { buf += chunk.toString(); };
    child.stdout.on("data", take);
    child.stderr.on("data", take);
    child.on("error", (error) => finish(error));
  });
}

function printPdf(htmlPath, pdfPath) {
  try { rmSync(pdfPath); } catch { /* fresh */ }
  return chromeFile(htmlPath, pdfPath, ["--no-pdf-header-footer", "--print-to-pdf=" + pdfPath], "bytes written to file", 180000);
}

function printPng(htmlPath, pngPath) {
  try { rmSync(pngPath); } catch { /* fresh */ }
  return new Promise((resolve, reject) => {
    const dir = "/tmp/pdf-chrome-" + process.pid + "-" + Math.random().toString(16).slice(2);
    const child = spawn("google-chrome", [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=0",
      "--user-data-dir=" + dir,
      "--window-size=1400,9000",
      "--screenshot=" + pngPath,
      "--virtual-time-budget=4000",
      "file://" + htmlPath
    ], { stdio: "ignore", detached: true });
    let last = 0;
    let stable = 0;
    let settled = false;
    const started = Date.now();
    const finish = (error, size) => {
      if (settled) return;
      settled = true;
      clearInterval(timer);
      killGroup(child);
      rmSync(dir, { recursive: true, force: true });
      if (error) reject(error);
      else resolve(size);
    };
    const timer = setInterval(() => {
      let size = 0;
      try { size = statSync(pngPath).size; } catch { size = 0; }
      if (size > 20000 && size === last) stable += 1;
      else stable = 0;
      last = size;
      if (stable >= 4) {
        try { cropPng(pngPath); } catch (error) { finish(error); return; }
        let cropped = size;
        try { cropped = statSync(pngPath).size; } catch { cropped = size; }
        finish(null, cropped);
        return;
      }
      if (Date.now() - started > 90000) finish(new Error("png timeout " + pngPath));
    }, 400);
    child.on("error", (error) => finish(error));
  });
}

function cropPng(pngPath) {
  execFileSync("python3", ["-c", [
    "from PIL import Image",
    "im = Image.open(" + JSON.stringify(pngPath) + ").convert('RGB')",
    "w, h = im.size",
    "pix = im.load()",
    "last = 0",
    "for y in range(h):",
    "    hit = False",
    "    for x in range(0, w, 8):",
    "        r, g, b = pix[x, y]",
    "        if r < 250 or g < 250 or b < 250:",
    "            hit = True",
    "            break",
    "    if hit: last = y",
    "im.crop((0, 0, w, min(h, last + 36))).save(" + JSON.stringify(pngPath) + ", 'PNG')"
  ].join("\n")]);
}

function sheetPlain(html) {
  const cut = html.indexOf("<article>");
  const body = html.slice(html.indexOf("<body"), cut > 0 ? cut : html.length);
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function xmlEscape(value) {
  return String(value || "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

function stampSvg(svg, items) {
  let next = svg.replace(/<g id="go-deeper"[\s\S]*?<\/g>\s*/g, "");
  const vb = next.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  if (!vb) return next;
  const base = next.match(/data-src-base="(\d+(?:\.\d+)?)"/);
  const width = vb[1];
  const height = base ? Number(base[1]) : Number(vb[2]);
  if (!base) next = next.replace("<svg ", '<svg data-src-base="' + height + '" ');
  const rows = items.map((item) => {
    if (item.status === "confirm") return { text: kindLabel(item.kind) + ": " + item.label + " — confirm", href: "" };
    return { text: kindLabel(item.kind) + ": " + item.label + " — last checked " + item.lastChecked, href: item.href };
  });
  const lines = [{ text: "Sources and go deeper", href: "" }].concat(rows);
  const extra = 28 + lines.length * 22;
  next = next.replace(/viewBox="0 0 [^"]+"/, 'viewBox="0 0 ' + width + " " + (height + extra) + '"');
  const texts = lines.map((line, index) => {
    const y = height + 24 + index * 22;
    const fill = line.href ? "#e2e8f0" : (index === 0 ? "#f8fafc" : "#fdba74");
    const text = '<text x="36" y="' + y + '" fill="' + fill + '" font-size="13" font-family="system-ui,sans-serif">' + xmlEscape(line.text) + "</text>";
    return line.href ? '<a href="' + xmlEscape(line.href) + '">' + text + "</a>" : text;
  }).join("");
  const panel = '<rect x="0" y="' + height + '" width="' + width + '" height="' + extra + '" fill="#0b1020"/>' + texts;
  return next.replace("</svg>", '<g id="go-deeper">' + panel + "</g></svg>");
}

if (process.argv.includes("--svg-only")) {
  const sheetsDir = join(root, "downloads/sheets");
  for (const name of readdirSync(sheetsDir).filter((item) => item.endsWith(".html"))) {
    const stem = name.replace(/\.html$/, "");
    const doc = JSON.parse(readFileSync(join(sheetsDir, stem, "sources.json"), "utf8"));
    const svgPath = join(sheetsDir, stem + ".svg");
    writeFileSync(svgPath, stampSvg(readFileSync(svgPath, "utf8"), doc.items));
    console.log("svg", stem);
  }
  process.exit(0);
}

async function renderArtifacts() {
  const sheetsDir = join(root, "downloads/sheets");
  const names = readdirSync(sheetsDir).filter((name) => name.endsWith(".html")).map((name) => name.replace(/\.html$/, ""));
  for (const name of names) {
    const htmlPath = join(sheetsDir, name + ".html");
    const jsonPath = join(sheetsDir, name, "sources.json");
    const doc = JSON.parse(readFileSync(jsonPath, "utf8"));
    const html = readFileSync(htmlPath, "utf8");
    const title = (html.match(/<h1>([^<]+)<\/h1>/) || [0, name])[1];
    const plain = sheetPlain(html);
    writeFileSync(join(sheetsDir, name + ".md"), markdownDocument(title, plain, sourcesMarkdown(doc.items)));
    writeFileSync(join(sheetsDir, name + ".docx"), Buffer.from(docxDocument(title, plain, sourcesPlain(doc.items))));
    writeFileSync(join(sheetsDir, name + ".pptx"), Buffer.from(pptxDocument(title, plain, sourcesPlain(doc.items))));
    const svgPath = join(sheetsDir, name + ".svg");
    writeFileSync(svgPath, stampSvg(readFileSync(svgPath, "utf8"), doc.items));
  }
  const downloads = join(root, "downloads.html");
  let catalog = readFileSync(downloads, "utf8");
  catalog = catalog.replace(
    /href="downloads\/sheets\/([^"]+)\.html">HTML<\/a> · <a href="downloads\/sheets\/\1\.svg">SVG<\/a> · <a href="downloads\/sheets\/\1\.pdf">PDF<\/a> · <a href="downloads\/sheets\/\1\.png">PNG<\/a>/g,
    'href="downloads/sheets/$1.html">HTML</a> · <a href="downloads/sheets/$1.md">MD</a> · <a href="downloads/sheets/$1.docx">DOCX</a> · <a href="downloads/sheets/$1.pptx">PPTX</a> · <a href="downloads/sheets/$1.svg">SVG</a> · <a href="downloads/sheets/$1.pdf">PDF</a> · <a href="downloads/sheets/$1.png">PNG</a>'
  );
  writeFileSync(downloads, catalog);
  const jobs = names.map((name) => ({
    html: join(sheetsDir, name + ".html"),
    pdf: join(sheetsDir, name + ".pdf"),
    png: join(sheetsDir, name + ".png")
  }));
  jobs.push({
    html: join(root, "downloads/flashcards-print.html"),
    pdf: join(root, "downloads/flashcards-print.pdf")
  });
  console.log("printing", jobs.length, "pdfs");
  for (const job of jobs) {
    const size = await printPdf(job.html, job.pdf);
    console.log("pdf", job.pdf.slice(root.length + 1), size);
    if (job.png) {
      const pngSize = await printPng(job.html, job.png);
      console.log("png", job.png.slice(root.length + 1), pngSize);
    }
  }
}

if (pdfOnly) {
  await renderArtifacts();
  process.exit(0);
}

const catalogById = new Map(CATALOG.map((item) => [item.id, item]));
const rooms = roomFiles().map((file) => {
  const html = readFileSync(join(root, "rooms", file), "utf8");
  const id = roomIdFrom(file, html);
  const title = (html.match(/data-room-title="([^"]+)"/) || [0, id])[1];
  return { file, id, title, html, cites: citeLinks(html) };
});

const urls = new Set(CATALOG.map((item) => item.href));
rooms.forEach((room) => room.cites.forEach((cite) => urls.add(cite.href)));
let opened;
if (fromLog) {
  const saved = JSON.parse(readFileSync(join(root, "data/source-check-log.json"), "utf8"));
  opened = new Map(saved.results.map((row) => [row.url, row]));
  console.log("reusing", saved.checked, "log", opened.size, "urls");
} else {
  console.log("opening", urls.size, "urls");
  const results = await pool([...urls], 8, async (url) => ({ url, ...(await openUrl(url)) }));
  opened = new Map(results.map((row) => [row.url, row]));
  const log = results.map((row) => ({ url: row.url, ok: row.ok, status: row.status, error: row.error || "" }));
  mkdirSync(join(root, "data"), { recursive: true });
  writeFileSync(join(root, "data/source-check-log.json"), JSON.stringify({ checked: LAST, results: log }, null, 2) + "\n");
  console.log("opened", log.filter((row) => row.ok).length, "of", log.length);
}

function fromCatalog(ids) {
  const items = [];
  ids.forEach((cid) => {
    const entry = catalogById.get(cid);
    if (!entry) return;
    const hit = opened.get(entry.href);
    if (hit && hit.ok) items.push({ kind: entry.kind, label: entry.label, href: entry.href, status: "checked", lastChecked: LAST });
  });
  return items;
}

function fromCites(cites) {
  const items = [];
  cites.forEach((cite) => {
    const hit = opened.get(cite.href);
    if (!hit || !hit.ok) return;
    items.push({ kind: "vendor", label: cite.label || cite.href, href: cite.href, status: "checked", lastChecked: LAST });
  });
  return items;
}

const byRoom = new Map();
rooms.forEach((room) => {
  const packIds = packsFor(room.id).flatMap((name) => PACKS[name] || []);
  const doc = record(room.id, room.title, fromCatalog(packIds).concat(fromCites(room.cites)));
  byRoom.set(room.id, doc);
  writeJson(join(root, "rooms/sources", room.id, "sources.json"), doc);
  const block = sourcesHtml(doc.items, "sources/" + room.id + "/sources.json");
  writeFileSync(join(root, "rooms", room.file), stampRoom(room.html, block));
  const citePath = join(root, "cites", room.id + ".md");
  let md = "";
  try { md = readFileSync(citePath, "utf8"); } catch { md = "# " + room.id + "\n"; }
  md = md.replace(/\n## Sources and go deeper[\s\S]*$/, "\n");
  writeFileSync(citePath, md.trimEnd() + "\n\n" + sourcesMarkdown(doc.items));
});

for (const track of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"]) {
  const members = [...byRoom.values()].filter((doc) => doc.id.startsWith(track));
  const merged = record(track, track + " chapter", members.flatMap((doc) => doc.items.filter((item) => item.status === "checked")));
  writeJson(join(root, "tracks", track, "sources.json"), merged);
  const page = join(root, "tracks", track, "index.html");
  const html = readFileSync(page, "utf8").replace(/<p><a href="chapter\.md">Chapter notes \(Markdown\)<\/a><\/p>\n?/g, "");
  const block = sourcesHtml(merged.items, "sources.json") + "<p><a href=\"chapter.md\">Chapter notes (Markdown)</a></p>";
  writeFileSync(page, stampBefore(html, "</main>", block, false));
}

for (const [sheet, ids] of Object.entries(SHEETS)) {
  const members = ids.map((id) => byRoom.get(id)).filter(Boolean);
  const merged = record(sheet, sheet, members.flatMap((doc) => doc.items.filter((item) => item.status === "checked")));
  writeJson(join(root, "downloads/sheets", sheet, "sources.json"), merged);
  const page = join(root, "downloads/sheets", sheet + ".html");
  const html = readFileSync(page, "utf8");
  writeFileSync(page, stampBefore(html, "<footer", sourcesHtml(merged.items, sheet + "/sources.json"), true));
}

const deckIds = ["T2-R06", "T7-R01", "T7-R03", "T2-R01"];
const deck = record("flashcards", "Flashcard deck", deckIds.flatMap((id) => (byRoom.get(id) || { items: [] }).items.filter((item) => item.status === "checked")));
writeJson(join(root, "downloads/sources/flashcards/sources.json"), deck);
const cardsPath = join(root, "downloads/flashcards.json");
const cards = JSON.parse(readFileSync(cardsPath, "utf8"));
cards.goDeeper = deck;
writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + "\n");
const printPath = join(root, "downloads/flashcards-print.html");
writeFileSync(printPath, stampBefore(readFileSync(printPath, "utf8"), "<footer", sourcesHtml(deck.items, "sources/flashcards/sources.json"), true));
const cardsPage = join(root, "flashcards.html");
writeFileSync(cardsPage, stampBefore(readFileSync(cardsPage, "utf8"), "</div></main>", sourcesHtml(deck.items, "downloads/sources/flashcards/sources.json"), false));

const labIds = ["webex", "sip", "rtp", "tls", "cc", "releaseCalling", "releaseWxcc"].flatMap((name) => PACKS[name] || []);
const lab = record("lab", "Webex lab", fromCatalog(labIds));
writeJson(join(root, "downloads/sources/lab/sources.json"), lab);
const labBlock = sourcesHtml(lab.items, "../sources/lab/sources.json");
for (const name of readdirSync(join(root, "downloads/diagrams")).filter((item) => item.endsWith(".html"))) {
  const page = join(root, "downloads/diagrams", name);
  writeFileSync(page, stampBefore(readFileSync(page, "utf8"), "<footer", labBlock, true));
}
for (const track of ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"]) {
  const page = join(root, "tracks", track, "chapter.md");
  const doc = JSON.parse(readFileSync(join(root, "tracks", track, "sources.json"), "utf8"));
  writeFileSync(page, markdownDocument(track + " chapter", "Chapter notes for " + track + ".", sourcesMarkdown(doc.items)));
}

if (!noPdf) await renderArtifacts();

console.log("sources", byRoom.size, "rooms");
console.log("sample", sourcesPlain(byRoom.get("T2-R01").items).split("\n").slice(0, 8).join(" | "));
