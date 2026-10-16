/** Standalone exports. The disclaimer matches the site footer. No network. */

export const DISCLAIMER_HTML =
  "<p>This is an <strong>independent, free, learning-only student project</strong>. " +
  "It respects every company and vendor, and every trademark belongs to its owner. " +
  "It is <strong>not affiliated with or endorsed by</strong> any of them.</p>" +
  '<p>If anyone has a concern, the content will be removed or corrected promptly: please write via ' +
  '<a href="https://cyphermonkeylabs.com/#contact">https://cyphermonkeylabs.com/#contact</a>. ' +
  "Nothing here is sold, and I am happy to volunteer for any organization.</p>";

export const BRAND_LINKS =
  '<nav aria-label="CypherMonkey Labs links">' +
  '<a href="https://cyphermonkeylabs.com">CypherMonkey Labs</a> ' +
  '<a href="https://github.com/CypherMonkeyLabs">GitHub organization</a> ' +
  '<a href="https://linktr.ee/cyphermonkey">Linktree</a></nav>';

export function standaloneDocument(title, bodyHtml) {
  var name = String(title || "Export").replace(/[<>]/g, "");
  return "<!DOCTYPE html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>" + name + "</title>" +
    "<style>body{font:18px/1.5 system-ui,sans-serif;margin:24px;color:#1b1340;background:#f8f5ff}" +
    "a{color:#5b21b6}footer{margin-top:32px;padding:16px;border:2px solid #0f766e;border-radius:16px;background:#ecfdf5}" +
    "</style></head><body><article>" + (bodyHtml || "") + "</article>" +
    '<footer data-canon-footer><p class="footer-brand">CypherMonkey Labs</p>' +
    DISCLAIMER_HTML +
    "<p>© 2026 CypherMonkeyLabs 🐒</p>" +
    BRAND_LINKS +
    "<p>MIT code. CC BY-NC-SA content.</p></footer></body></html>";
}

export function markdownDocument(title, body) {
  return "# " + String(title || "Export") + "\n\n" + String(body || "") + "\n\n---\n\n" +
    "Independent, free, learning-only student project. Not affiliated with or endorsed by any vendor. " +
    "Trademarks belong to their owners. Concerns: https://cyphermonkeylabs.com/#contact\n\n" +
    "CypherMonkey Labs\n\n© 2026 CypherMonkeyLabs\n\n" +
    "https://cyphermonkeylabs.com\nhttps://github.com/CypherMonkeyLabs\nhttps://linktr.ee/cyphermonkey\n";
}

function xmlEscape(value) {
  return String(value || "").replace(/[&<>]/g, function (ch) {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    return "&gt;";
  });
}

function crc32(bytes) {
  var table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (var n = 0; n < 256; n += 1) {
      var c = n;
      for (var k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    crc32.table = table;
  }
  var crc = 0xffffffff;
  for (var i = 0; i < bytes.length; i += 1) crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(files) {
  var encoder = new TextEncoder();
  var parts = [];
  var central = [];
  var offset = 0;
  files.forEach(function (file) {
    var name = encoder.encode(file.name);
    var data = encoder.encode(file.text);
    var crc = crc32(data);
    var local = new Uint8Array(30 + name.length + data.length);
    var view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    parts.push(local);
    var cen = new Uint8Array(46 + name.length);
    var cv = new DataView(cen.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    cen.set(name, 46);
    central.push(cen);
    offset += local.length;
  });
  var centralSize = central.reduce(function (sum, part) { return sum + part.length; }, 0);
  var end = new Uint8Array(22);
  var ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  var total = offset + centralSize + end.length;
  var out = new Uint8Array(total);
  var cursor = 0;
  parts.concat(central, [end]).forEach(function (part) {
    out.set(part, cursor);
    cursor += part.length;
  });
  return out;
}

var NOTE = [
  "Independent, free, learning-only student project. Not affiliated with or endorsed by any vendor.",
  "Trademarks belong to their owners.",
  "Concerns: https://cyphermonkeylabs.com/#contact",
  "CypherMonkey Labs",
  "© 2026 CypherMonkeyLabs",
  "https://cyphermonkeylabs.com",
  "https://github.com/CypherMonkeyLabs",
  "https://linktr.ee/cyphermonkey"
];

function paragraphs(title, body) {
  var lines = [String(title || "Section")].concat(String(body || "").split(/\n+/), NOTE);
  return lines.map(function (line) { return line.replace(/\s+/g, " ").trim(); }).filter(Boolean);
}

export function docxDocument(title, body) {
  var bodyXml = paragraphs(title, body).map(function (line) {
    return "<w:p><w:r><w:t xml:space=\"preserve\">" + xmlEscape(line) + "</w:t></w:r></w:p>";
  }).join("");
  var documentXml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
    "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body>" +
    bodyXml + "<w:sectPr/></w:body></w:document>";
  return zipStore([
    { name: "[Content_Types].xml", text: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">" +
      "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>" +
      "<Default Extension=\"xml\" ContentType=\"application/xml\"/>" +
      "<Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>" +
      "</Types>" },
    { name: "_rels/.rels", text: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
      "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>" +
      "</Relationships>" },
    { name: "word/document.xml", text: documentXml }
  ]);
}

export function pptxDocument(title, body) {
  var lines = paragraphs(title, body).slice(0, 12);
  var shapes = lines.map(function (line, index) {
    var y = 200000 + index * 420000;
    return "<p:sp><p:nvSpPr><p:cNvPr id=\"" + (index + 2) + "\" name=\"Line " + (index + 1) + "\"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>" +
      "<p:spPr><a:xfrm><a:off x=\"360000\" y=\"" + y + "\"/><a:ext cx=\"8400000\" cy=\"380000\"/></a:xfrm><a:prstGeom prst=\"rect\"><a:avLst/></a:prstGeom></p:spPr>" +
      "<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang=\"en-US\" sz=\"" + (index === 0 ? "2800" : "1600") + "\" dirty=\"0\"/>" +
      "<a:t>" + xmlEscape(line) + "</a:t></a:r></a:p></p:txBody></p:sp>";
  }).join("");
  var slide = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
    "<p:sld xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" xmlns:p=\"http://schemas.openxmlformats.org/presentationml/2006/main\">" +
    "<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id=\"1\" name=\"\"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>" +
    shapes + "</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>";
  return zipStore([
    { name: "[Content_Types].xml", text: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">" +
      "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>" +
      "<Default Extension=\"xml\" ContentType=\"application/xml\"/>" +
      "<Override PartName=\"/ppt/presentation.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml\"/>" +
      "<Override PartName=\"/ppt/slides/slide1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.presentationml.slide+xml\"/>" +
      "</Types>" },
    { name: "_rels/.rels", text: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
      "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"ppt/presentation.xml\"/>" +
      "</Relationships>" },
    { name: "ppt/presentation.xml", text: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<p:presentation xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" xmlns:p=\"http://schemas.openxmlformats.org/presentationml/2006/main\">" +
      "<p:sldIdLst><p:sldId id=\"256\" r:id=\"rId1\"/></p:sldIdLst><p:sldSz cx=\"9144000\" cy=\"6858000\"/></p:presentation>" },
    { name: "ppt/_rels/presentation.xml.rels", text: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
      "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide\" Target=\"slides/slide1.xml\"/>" +
      "</Relationships>" },
    { name: "ppt/slides/slide1.xml", text: slide }
  ]);
}
