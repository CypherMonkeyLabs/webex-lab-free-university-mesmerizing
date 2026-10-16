/** Render a Sources and go deeper block. A confirm row never carries a URL. */

const KIND_LABEL = {
  rfc: "RFC",
  vendor: "Vendor doc",
  ports: "Port table",
  community: "Community",
  wikipedia: "Wikipedia",
  srnd: "SRND",
  devdocs: "DevDocs",
  release: "Release notes"
};

export function kindLabel(kind) {
  return KIND_LABEL[kind] || "Source";
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"]/g, function (ch) {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    return "&quot;";
  });
}

function checked(item) {
  return item && item.status === "checked" && item.href && /^\d{4}-\d{2}$/.test(item.lastChecked || "");
}

export function assertSources(items) {
  (items || []).forEach(function (item) {
    if (item.status === "confirm") {
      if (item.href) throw new Error("confirm row has a URL: " + item.label);
      return;
    }
    if (!checked(item)) throw new Error("checked row is incomplete: " + (item && item.label));
  });
}

export function sourcesHtml(items, jsonHref) {
  assertSources(items);
  var rows = items.map(function (item) {
    var kind = escapeHtml(kindLabel(item.kind));
    if (item.status === "confirm") {
      return "<li><span class=\"src-kind\" style=\"font-weight:800\">" + kind + "</span> " + escapeHtml(item.label) + " <span class=\"src-confirm\" style=\"font-weight:800;color:#9a3412\">confirm</span></li>";
    }
    return "<li><span class=\"src-kind\" style=\"font-weight:800\">" + kind + "</span> <a href=\"" + escapeHtml(item.href) + "\" style=\"color:#134e4a\">" + escapeHtml(item.label) + "</a> <span class=\"src-checked\">last checked " + escapeHtml(item.lastChecked) + "</span></li>";
  }).join("");
  var file = jsonHref ? "<p><a href=\"" + escapeHtml(jsonHref) + "\">sources.json</a> for this page.</p>" : "";
  return "<section id=\"go-deeper\" class=\"go-deeper\" style=\"margin:28px 0;padding:16px 18px;border:2px solid #134e4a;border-radius:16px;background:#f0fdfa;color:#042f2e\"><h2 style=\"margin:0 0 8px;color:#042f2e\">Sources and go deeper</h2>" +
    "<p>Checked links were opened this month. A confirm row has no address because that page was not opened.</p><ul>" +
    rows + "</ul>" + file + "</section>";
}

export function sourcesMarkdown(items) {
  assertSources(items);
  var lines = [
    "## Sources and go deeper",
    "",
    "Checked links were opened this month. A confirm row has no address because that page was not opened.",
    ""
  ];
  items.forEach(function (item) {
    if (item.status === "confirm") lines.push("- " + kindLabel(item.kind) + ": " + item.label + " — confirm");
    else lines.push("- " + kindLabel(item.kind) + ": [" + item.label + "](" + item.href + ") — last checked " + item.lastChecked);
  });
  return lines.join("\n") + "\n";
}

export function sourcesPlain(items) {
  assertSources(items);
  var lines = ["Sources and go deeper"];
  items.forEach(function (item) {
    if (item.status === "confirm") lines.push(kindLabel(item.kind) + ": " + item.label + " — confirm");
    else lines.push(kindLabel(item.kind) + ": " + item.label + " — " + item.href + " — last checked " + item.lastChecked);
  });
  return lines.join("\n");
}
