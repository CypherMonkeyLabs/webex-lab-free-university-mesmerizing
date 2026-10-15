/** SVG illustration renderer. One figure per lesson, built from a small node list. */

const TONE = ["tone-1", "tone-2", "tone-3", "tone-4"];

export function renderDiagram(spec, reduceMotion) {
  const figure = document.createElement("figure");
  figure.className = "figure";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 640 320");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", spec.caption || "Lesson diagram");
  svg.classList.add("diagram");
  if (reduceMotion) svg.classList.add("is-still");

  const bg = el("rect", { x: 0, y: 0, width: 640, height: 320, rx: 18, class: "diagram-bg" });
  svg.append(bg);

  const nodes = spec.nodes || [];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const edge of spec.edges || []) {
    const a = byId.get(edge.from);
    const b = byId.get(edge.to);
    if (!a || !b) continue;
    const path = el("path", {
      d: curve(a, b),
      class: "diagram-edge",
      fill: "none",
    });
    svg.append(path);
    if (edge.label) {
      const mid = pointOn(a, b, 0.5);
      const text = el("text", { x: mid.x, y: mid.y - 8, class: "diagram-edge-label" });
      text.textContent = edge.label;
      svg.append(text);
    }
  }

  for (const node of nodes) {
    const g = el("g", { class: `diagram-node ${TONE[(node.tone || 1) - 1] || "tone-1"}` });
    g.append(el("rect", { x: node.x, y: node.y, width: node.w || 150, height: node.h || 64, rx: 14, class: "diagram-card" }));
    const title = el("text", { x: node.x + 14, y: node.y + 28, class: "diagram-title" });
    title.textContent = node.label;
    g.append(title);
    if (node.sub) {
      const sub = el("text", { x: node.x + 14, y: node.y + 48, class: "diagram-sub" });
      sub.textContent = node.sub;
      g.append(sub);
    }
    svg.append(g);
  }

  figure.append(svg);
  if (spec.caption) {
    const cap = document.createElement("figcaption");
    cap.textContent = spec.caption;
    figure.append(cap);
  }
  return figure;
}

function curve(a, b) {
  const x1 = a.x + (a.w || 150);
  const y1 = a.y + (a.h || 64) / 2;
  const x2 = b.x;
  const y2 = b.y + (b.h || 64) / 2;
  const c = Math.max(40, Math.abs(x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
}

function pointOn(a, b, t) {
  const x1 = a.x + (a.w || 150);
  const y1 = a.y + (a.h || 64) / 2;
  const x2 = b.x;
  const y2 = b.y + (b.h || 64) / 2;
  return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
}

function el(name, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.setAttribute("class", value);
    else node.setAttribute(key, String(value));
  }
  return node;
}
