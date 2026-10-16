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
