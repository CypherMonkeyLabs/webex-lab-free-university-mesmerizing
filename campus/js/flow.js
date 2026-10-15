/** Sequence-diagram player: Play, Pause, Step, Inspect. */

let timer = 0;

export function stopFlow() {
  if (timer) {
    clearInterval(timer);
    timer = 0;
  }
}

export function mountFlow(host, flow, options) {
  stopFlow();
  host.replaceChildren();
  const steps = flow?.steps || [];
  const wrap = document.createElement("section");
  wrap.className = "flow-player";
  const heading = document.createElement("h2");
  heading.textContent = flow?.title || "Step-through";
  wrap.append(heading);

  const bar = document.createElement("div");
  bar.className = "flow-controls";
  const play = button("Play", "Play the flow");
  const pause = button("Pause", "Pause the flow");
  const step = button("Step", "Show the next step");
  const inspect = button("Inspect", "Inspect this step");
  bar.append(play, pause, step, inspect);
  wrap.append(bar);

  const live = document.createElement("p");
  live.className = "flow-live";
  live.setAttribute("aria-live", "polite");
  wrap.append(live);

  const svgHost = document.createElement("div");
  svgHost.className = "ladder-host";
  wrap.append(svgHost);

  const detail = document.createElement("div");
  detail.className = "inspect";
  detail.hidden = true;
  wrap.append(detail);

  let index = 0;
  let openInspect = false;

  function paint() {
    svgHost.replaceChildren(renderLadder(steps, index));
    const current = steps[index];
    live.textContent = current
      ? `Step ${index + 1} of ${steps.length}: ${current.from} to ${current.to}. ${current.label}.`
      : "No steps.";
    if (openInspect && current) {
      detail.hidden = false;
      detail.replaceChildren();
      const title = document.createElement("h3");
      title.textContent = "Inspect";
      const pre = document.createElement("pre");
      pre.textContent = current.inspect || current.detail;
      const p = document.createElement("p");
      p.textContent = current.detail;
      detail.append(title, p, pre);
      if (current.cite) {
        const a = document.createElement("a");
        a.href = current.cite;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Source for this step";
        detail.append(a);
      }
    } else {
      detail.hidden = true;
    }
    if (options?.onStep && current) options.onStep(current, index);
  }

  function next() {
    if (!steps.length) return;
    index = (index + 1) % steps.length;
    paint();
  }

  play.addEventListener("click", () => {
    stopFlow();
    if (options?.reduceMotion) {
      next();
      return;
    }
    timer = window.setInterval(next, 1700);
    play.setAttribute("aria-pressed", "true");
    pause.setAttribute("aria-pressed", "false");
  });
  pause.addEventListener("click", () => {
    stopFlow();
    play.setAttribute("aria-pressed", "false");
    pause.setAttribute("aria-pressed", "true");
  });
  step.addEventListener("click", () => {
    stopFlow();
    play.setAttribute("aria-pressed", "false");
    next();
  });
  inspect.addEventListener("click", () => {
    openInspect = !openInspect;
    inspect.setAttribute("aria-pressed", openInspect ? "true" : "false");
    paint();
  });

  paint();
  host.append(wrap);
  return stopFlow;
}

function button(label, name) {
  const node = document.createElement("button");
  node.type = "button";
  node.className = "btn";
  node.textContent = label;
  node.setAttribute("aria-label", name);
  return node;
}

function renderLadder(steps, active) {
  const actors = [];
  for (const step of steps) {
    if (!actors.includes(step.from)) actors.push(step.from);
    if (!actors.includes(step.to)) actors.push(step.to);
  }
  if (!actors.length) actors.push("Start", "End");
  const width = Math.max(640, actors.length * 150);
  const height = 86 + steps.length * 62;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "ladder");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Animated message flow");

  const col = {};
  actors.forEach((name, i) => {
    const x = 80 + i * ((width - 120) / Math.max(actors.length - 1, 1));
    col[name] = x;
    const text = ns("text", { x, y: 28, class: "ladder-actor" });
    text.textContent = name;
    svg.append(text);
    svg.append(ns("line", { x1: x, y1: 42, x2: x, y2: height - 16, class: "ladder-life" }));
  });

  steps.forEach((step, i) => {
    const y = 78 + i * 62;
    const x1 = col[step.from];
    const x2 = col[step.to];
    const activeClass = i === active ? " is-active" : i < active ? " is-done" : "";
    svg.append(ns("line", {
      x1, y1: y, x2, y2: y,
      class: `ladder-msg${activeClass}`,
    }));
    const dir = x2 >= x1 ? 1 : -1;
    svg.append(ns("polygon", {
      points: arrowPoints(x2, y, dir),
      class: `ladder-head${activeClass}`,
    }));
    const label = ns("text", { x: (x1 + x2) / 2, y: y - 8, class: `ladder-label${activeClass}` });
    label.textContent = `${i + 1}. ${step.label}`;
    svg.append(label);
  });
  return svg;
}

function arrowPoints(x, y, dir) {
  const tip = x;
  const back = x - dir * 10;
  return `${tip},${y} ${back},${y - 5} ${back},${y + 5}`;
}

function ns(name, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.setAttribute("class", value);
    else node.setAttribute(key, String(value));
  }
  return node;
}
