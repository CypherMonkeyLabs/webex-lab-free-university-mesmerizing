import { simulateDial, sampleDialInput, DIAL_CITES } from "./dialplan.js";
import { ACTIVITIES, emptyFlow, sampleContact, simulateFlow, activityByType, FLOW_CITE } from "./flowmodel.js";
import { mountFlow, stopFlow } from "./flow.js";
import { playTone } from "./audio.js";

const HUB_CITE = "https://help.webex.com/en-us/article/n2hzeox/access-dedicated-instance-applications-from-control-hub";

const HUB_STEPS = [
  {
    id: "overview",
    nav: "Overview",
    title: "Organization",
    path: "Control Hub customer view",
    body: "Control Hub is the admin portal for the Webex organization. Calling, devices, contact center, and Dedicated Instance are reached from this shell. This practice console uses the documented information architecture. It is not the live admin.webex.com product.",
    cite: "https://help.webex.com/en-us/article/njvdjf2/Configure-Webex-Calling-for-your-organization",
  },
  {
    id: "users",
    nav: "Users",
    title: "Users and licenses",
    path: "Users",
    body: "Users receive Webex Calling licenses here. Professional, Standard, and Workspace licenses do not carry the same features. A contact center activation email is also a user action for Contact Center Service Administrators.",
    cite: "https://help.webex.com/article/n1qbbp7/Features-available-by-license-type-for-Webex-Calling",
  },
  {
    id: "locations",
    nav: "Locations",
    title: "Calling locations",
    path: "Calling > Locations",
    body: "A location holds the time zone, main number, dialing habits, and PSTN connection. Create the location before you assign premises-based PSTN. Extension length, routing prefix, and external dialing digit live with location dialing.",
    cite: "https://help.webex.com/en-us/article/njvdjf2/Configure-Webex-Calling-for-your-organization",
  },
  {
    id: "pstn",
    nav: "PSTN",
    title: "PSTN connection",
    path: "Calling > Locations > PSTN connection",
    body: "Choose Cisco Calling Plan, Cloud Connected PSTN, or premises-based PSTN through a local gateway. Cloud PSTN cannot be used by calls that originate from premises users. A premises location uses one trunk.",
    cite: "https://help.webex.com/en-us/article/n0xb944/Configure-trunks,-route-groups,-and-dial-plans-for-Webex-Calling",
  },
  {
    id: "dial",
    nav: "Dial plans",
    title: "Trunks, route groups, dial plans",
    path: "Calling > Call routing > Dial plans",
    body: "Dial plans are enterprise-wide. Each plan picks a trunk or route group and lists dial patterns for on-premises destinations. The Webex Contact Center voice article shows the same Create Dial Plan action for premise destinations.",
    cite: "https://help.webex.com/en-us/article/2dputx/Set-up-voice-channels-for-Webex-Contact-Center",
  },
  {
    id: "aa",
    nav: "Auto attendant",
    title: "Auto attendant",
    path: "Calling > Features > Auto Attendant",
    body: "Auto attendant is a location feature. Bulk CSV management and analytics live on the auto attendant card. Reports include business-hours and after-hours key details under Monitoring > Reports.",
    cite: "https://help.webex.com/en-us/article/nsioxoi",
  },
  {
    id: "queue",
    nav: "Call queue",
    title: "Call queue",
    path: "Calling > Features > Call Queue",
    body: "Priority-based routing includes Circular, Top Down, Longest Idle, Weighted, and Simultaneous, with the agent caps Cisco publishes on the call queue article. Bulk Manage accepts the CallQueueBulk.csv produced by migration tools.",
    cite: "https://help.webex.com/en-us/article/nzkg083/Configure-Call-Queue",
  },
  {
    id: "di",
    nav: "Dedicated Instance",
    title: "Dedicated Instance",
    path: "Calling > Dedicated Instance > Manage",
    body: "Cross-launch Unified CM, Unity Connection, and Expressway from this tab. Activation sizes those applications from the First Time Setup Wizard, and you still activate the interop SIP trunk to multi-tenant Webex Calling.",
    cite: HUB_CITE,
  },
  {
    id: "devices",
    nav: "Devices",
    title: "Devices",
    path: "Devices",
    body: "Phones, ATA, and RoomOS devices are claimed here. HELD-capable MPP phones need a resync or reinitialization after emergency calling is enabled, or they pick up configuration on their next check.",
    cite: "https://help.webex.com/en-us/article/av6oo3",
  },
  {
    id: "wxcc",
    nav: "Contact Center",
    title: "Contact Center",
    path: "Contact Center > Flow Designer",
    body: "Provision entry points, queues, teams, desktop profiles, and audio files before you draw a flow. Queue Contact selects a queue. Resource collections can hide queues from a delegated administrator.",
    cite: "https://help.webex.com/en-us/article/nhovcy4/Build-and-manage-flows-with-Flow-Designer",
  },
  {
    id: "migrate",
    nav: "Migrations",
    title: "Migration Insights",
    path: "Services > Updates & Migrations > Migration Insights",
    body: "Import the Unified CM tar and, if you want feature-usage analysis, CDR files. The tool writes device eligibility and hunt, queue, park, and pickup reports. It does not import UCCX scripts into Flow Designer.",
    cite: "https://help.webex.com/en-us/article/4yz2zd/Prepare-to-migrate-from-Unified-CM-to-Webex-Calling",
  },
];

export function mountStudioHome(host) {
  host.append(studioIntro());
  const grid = document.createElement("div");
  grid.className = "card-grid";
  grid.append(
    toolCard("Flow designer", "Place Flow Designer activities, connect ports, and walk a test contact.", "#/studio/flow"),
    toolCard("Dial-plan simulator", "Apply location dialing, dial patterns, and the premises-to-cloud PSTN limit.", "#/studio/dial"),
    toolCard("Control Hub walkthrough", "Click the documented path through a practice console.", "#/studio/hub"),
    toolCard("3D topology", "Orbit the calling, contact center, and migration map. Toggle failures.", "#/topology"),
  );
  host.append(grid);
}

export function mountDial(host) {
  const input = sampleDialInput();
  host.append(studioIntro("Dial-plan simulator", "A lab model of location dialing, enterprise dial plans, and the documented PSTN limits. Pattern precedence is labeled as a teaching order."));
  const layout = document.createElement("div");
  layout.className = "split";
  const form = document.createElement("form");
  form.className = "panel stack";
  form.append(
    field("Dialed string", "dialed", input.dialed),
    field("Extension length", "extensionLength", String(input.extensionLength), "number"),
    field("External dial digit", "externalDigit", input.externalDigit),
    field("This location", "locationName", input.locationName),
    field("Routing prefix", "routingPrefix", input.routingPrefix),
    selectField("PSTN connection", "pstn", [
      ["lgw", "Premises-based PSTN (Local Gateway)"],
      ["ccp", "Cloud Connected PSTN"],
      ["cisco", "Cisco Calling Plan"],
    ], input.pstn),
    selectField("Call origin", "origin", [
      ["webex-user", "Webex Calling user"],
      ["premises-pbx", "Premises PBX user"],
    ], input.origin),
    selectField("Enhanced emergency", "emergencyEnabled", [
      ["yes", "Enabled for this location"],
      ["no", "Not enabled"],
    ], "yes"),
    selectField("Emergency provider", "emergencyProvider", [
      ["redsky", "RedSky"],
      ["intrado", "Intrado"],
    ], "redsky"),
    field("Trunks selected for this premises location", "trunkCount", "1", "number"),
    field("Other location name", "otherName", "Austin"),
    field("Other location prefix", "otherPrefix", "22"),
    field("Dial pattern", "pattern", "+1804555XXXX"),
    field("Pattern routing choice", "route", "Trunk LGW-Richmond"),
  );
  const presets = document.createElement("div");
  presets.className = "chip-row";
  for (const preset of PRESETS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = preset.label;
    b.addEventListener("click", () => {
      for (const [key, value] of Object.entries(preset.values)) {
        const node = form.elements.namedItem(key);
        if (node && "value" in node) node.value = value;
      }
      run();
    });
    presets.append(b);
  }
  const runBtn = document.createElement("button");
  runBtn.type = "submit";
  runBtn.className = "btn primary";
  runBtn.textContent = "Simulate";
  form.append(presets, runBtn);

  const out = document.createElement("div");
  out.className = "panel stack";
  out.setAttribute("aria-live", "polite");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });

  function run() {
    const data = Object.fromEntries(new FormData(form).entries());
    const result = simulateDial({
      dialed: data.dialed,
      extensionLength: Number(data.extensionLength),
      externalDigit: data.externalDigit,
      locationName: data.locationName,
      routingPrefix: data.routingPrefix,
      otherLocations: [{ name: data.otherName, prefix: data.otherPrefix, extensionLength: Number(data.extensionLength) }],
      patterns: [{ pattern: data.pattern, route: data.route }],
      pstn: data.pstn,
      origin: data.origin,
      trunkCount: Number(data.trunkCount),
      emergencyProvider: data.emergencyProvider,
      emergencyEnabled: data.emergencyEnabled === "yes",
    });
    playTone(result.ok ? "ok" : "bad");
    out.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = result.route;
    const norm = document.createElement("p");
    norm.textContent = result.normalized ? `Shown number: ${result.normalized}` : "No normalized number.";
    out.append(h, norm);
    if (result.warnings?.length) {
      for (const warning of result.warnings) out.append(note(warning, "warn"));
    }
    const list = document.createElement("ol");
    list.className = "trace";
    for (const row of result.trace) {
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = row.rule;
      const p = document.createElement("p");
      p.textContent = row.detail;
      item.append(strong, p);
      if (row.cite) {
        const a = document.createElement("a");
        a.href = row.cite;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Source";
        item.append(a);
      }
      list.append(item);
    }
    out.append(list);
  }

  layout.append(form, out);
  host.append(layout);
  run();
}

const PRESETS = [
  { label: "Internal extension", values: { dialed: "2100", origin: "webex-user", pstn: "lgw", emergencyEnabled: "yes" } },
  { label: "Other location", values: { dialed: "222100", origin: "webex-user", pstn: "lgw" } },
  { label: "Pattern to trunk", values: { dialed: "918045551234", origin: "webex-user", pstn: "lgw" } },
  { label: "933 to RedSky", values: { dialed: "933", emergencyEnabled: "yes", emergencyProvider: "redsky" } },
  { label: "911 PSTN fallback", values: { dialed: "911", emergencyEnabled: "no" } },
  { label: "Premises to cloud PSTN", values: { dialed: "918045559999", origin: "premises-pbx", pstn: "ccp", pattern: "+19999999999" } },
  { label: "Unmatched to gateway", values: { dialed: "917035550100", pstn: "lgw", origin: "webex-user", pattern: "+1804555XXXX" } },
  { label: "Two trunks", values: { dialed: "917035550100", pstn: "lgw", trunkCount: "2", pattern: "+1804555XXXX" } },
];

export function mountDesigner(host, reduceMotion) {
  const flow = emptyFlow();
  const contact = sampleContact();
  host.append(studioIntro("Flow designer", "Activities use the names Cisco documents in Flow Designer. The sample is schema webex-lab-flow-1. Export is a teaching JSON file, not a Control Hub import."));
  const layout = document.createElement("div");
  layout.className = "designer";

  const palette = document.createElement("div");
  palette.className = "palette";
  const palTitle = document.createElement("h2");
  palTitle.textContent = "Activities";
  palette.append(palTitle);
  for (const activity of ACTIVITIES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pal-btn";
    b.textContent = activity.title;
    b.title = activity.blurb;
    b.addEventListener("click", () => {
      const id = `n${Date.now().toString(36)}`;
      flow.nodes.push({
        id,
        type: activity.type,
        x: 40 + (flow.nodes.length % 3) * 200,
        y: 40 + Math.floor(flow.nodes.length / 3) * 90,
        label: activity.title,
      });
      selected = id;
      draw();
    });
    palette.append(b);
  }

  const board = document.createElement("div");
  board.className = "board";
  const canvas = document.createElement("div");
  canvas.className = "board-canvas";
  board.append(canvas);

  const side = document.createElement("div");
  side.className = "panel stack";
  let selected = flow.nodes[0]?.id || "";
  let connectFrom = "";

  const player = document.createElement("div");

  function draw() {
    canvas.replaceChildren();
    for (const edge of flow.edges) {
      const a = flow.nodes.find((node) => node.id === edge.from);
      const b = flow.nodes.find((node) => node.id === edge.to);
      if (!a || !b) continue;
      const line = document.createElement("div");
      line.className = "wire";
      line.style.left = `${a.x + 150}px`;
      line.style.top = `${a.y + 28}px`;
      const dx = b.x - (a.x + 150);
      const dy = (b.y + 28) - (a.y + 28);
      const length = Math.hypot(dx, dy);
      line.style.width = `${length}px`;
      line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      line.title = edge.when;
      canvas.append(line);
    }
    for (const node of flow.nodes) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `flow-node${node.id === selected ? " is-selected" : ""}`;
      card.style.left = `${node.x}px`;
      card.style.top = `${node.y}px`;
      const meta = activityByType(node.type);
      card.innerHTML = "";
      const k = document.createElement("span");
      k.className = "kicker";
      k.textContent = meta.title;
      const s = document.createElement("strong");
      s.textContent = node.label;
      card.append(k, s);
      card.addEventListener("click", () => {
        if (connectFrom && connectFrom !== node.id) {
          const from = flow.nodes.find((row) => row.id === connectFrom);
          const ports = activityByType(from.type).ports;
          const when = ports[0] || "out";
          flow.edges.push({ id: `e${Date.now().toString(36)}`, from: connectFrom, to: node.id, when });
          connectFrom = "";
          playTone("ok");
        }
        selected = node.id;
        draw();
      });
      canvas.append(card);
    }
    paintSide();
  }

  function paintSide() {
    const node = flow.nodes.find((row) => row.id === selected);
    side.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = node ? node.label : "Nothing selected";
    side.append(h);
    if (!node) return;
    const meta = activityByType(node.type);
    const p = document.createElement("p");
    p.textContent = meta.blurb;
    side.append(p);
    const label = document.createElement("label");
    label.textContent = "Label";
    const input = document.createElement("input");
    input.value = node.label;
    input.addEventListener("input", () => {
      node.label = input.value;
      const strong = canvas.querySelector(".flow-node.is-selected strong");
      if (strong) strong.textContent = input.value;
    });
    label.append(input);
    side.append(label);
    const ports = document.createElement("p");
    ports.textContent = `Ports: ${meta.ports.join(", ") || "none"}`;
    side.append(ports);
    const outgoing = flow.edges.filter((edge) => edge.from === node.id);
    for (const edge of outgoing) {
      const row = document.createElement("label");
      row.textContent = "Connection";
      const sel = document.createElement("select");
      for (const port of meta.ports) {
        const opt = document.createElement("option");
        opt.value = port;
        opt.textContent = port;
        if (port === edge.when) opt.selected = true;
        sel.append(opt);
      }
      sel.addEventListener("change", () => {
        edge.when = sel.value;
      });
      row.append(sel);
      side.append(row);
    }
    const actions = document.createElement("div");
    actions.className = "chip-row";
    actions.append(
      action("Connect from here", () => {
        connectFrom = node.id;
        playTone("step");
      }),
      action("Delete", () => {
        flow.nodes = flow.nodes.filter((row) => row.id !== node.id);
        flow.edges = flow.edges.filter((edge) => edge.from !== node.id && edge.to !== node.id);
        selected = flow.nodes[0]?.id || "";
        draw();
      }),
    );
    side.append(actions);
    const cite = document.createElement("a");
    cite.href = FLOW_CITE;
    cite.target = "_blank";
    cite.rel = "noopener noreferrer";
    cite.textContent = "Flow Designer article";
    side.append(cite);
  }

  const test = document.createElement("form");
  test.className = "panel inline-form";
  test.append(
    miniSelect("hours", [["open", "Hours open"], ["closed", "Hours closed"]], contact.hours),
    miniSelect("menuDigit", [["1", "Menu 1"], ["2", "Menu 2"], ["9", "Other digit"]], contact.menuDigit),
    miniSelect("http", [["success", "HTTP success"], ["error", "HTTP error"]], contact.http),
    miniSelect("va", [["escalated", "Virtual agent escalated"], ["done", "Virtual agent done"]], contact.va),
    miniSelect("condition", [["true", "Condition true"], ["false", "Condition false"]], contact.condition),
  );
  const sim = document.createElement("button");
  sim.type = "submit";
  sim.className = "btn primary";
  sim.textContent = "Simulate contact";
  const exp = document.createElement("button");
  exp.type = "button";
  exp.className = "btn";
  exp.textContent = "Export teaching JSON";
  test.append(sim, exp);
  test.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(test).entries());
    const result = simulateFlow(flow, data);
    playTone(result.ok ? "ok" : "bad");
    const asFlow = {
      title: "Contact walk",
      steps: result.steps.map((step, index) => ({
        from: index === 0 ? "Caller" : result.steps[index - 1].title,
        to: step.title,
        label: step.title,
        detail: step.detail,
        inspect: `${step.detail}\nSource: ${step.cite}`,
        cite: step.cite,
      })),
    };
    mountFlow(player, asFlow, { reduceMotion });
  });
  exp.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "webex-lab-flow.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  layout.append(palette, board, side);
  host.append(layout, test, player);
  draw();
}

export function mountHub(host, onProgress) {
  let stepIndex = Number(localStorage.getItem("webexlab.hubStep") || 0);
  if (stepIndex >= HUB_STEPS.length) stepIndex = 0;
  let current = "overview";
  host.append(studioIntro("Control Hub practice", "Follow the documented click path. The screens are original practice panels, not Cisco's interface."));
  const shell = document.createElement("div");
  shell.className = "hub";
  const nav = document.createElement("div");
  nav.className = "hub-nav";
  nav.setAttribute("role", "tablist");
  nav.setAttribute("aria-label", "Practice console sections");
  const main = document.createElement("div");
  main.className = "hub-main panel";
  shell.append(nav, main);
  host.append(shell);

  function renderNav() {
    nav.replaceChildren();
    for (const step of HUB_STEPS) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", current === step.id ? "true" : "false");
      b.textContent = step.nav;
      b.addEventListener("click", () => {
        current = step.id;
        playTone("nav");
        renderNav();
        renderMain();
      });
      nav.append(b);
    }
  }

  function renderMain() {
    const step = HUB_STEPS[stepIndex];
    const page = HUB_STEPS.find((row) => row.id === current) || HUB_STEPS[0];
    main.replaceChildren();
    const crumb = document.createElement("p");
    crumb.className = "kicker";
    crumb.textContent = page.path;
    const h = document.createElement("h2");
    h.textContent = page.title;
    const p = document.createElement("p");
    p.textContent = page.body;
    const a = document.createElement("a");
    a.href = page.cite;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "Cisco documentation for this screen";
    main.append(crumb, h, p, a);
    const coach = document.createElement("div");
    coach.className = "coach";
    const ch = document.createElement("h3");
    ch.textContent = `Guided step ${stepIndex + 1} of ${HUB_STEPS.length}`;
    const cp = document.createElement("p");
    cp.textContent = `Open ${step.nav}. Documented path: ${step.path}.`;
    const check = document.createElement("button");
    check.type = "button";
    check.className = "btn primary";
    check.textContent = "Check this step";
    const feedback = document.createElement("p");
    feedback.setAttribute("aria-live", "polite");
    check.addEventListener("click", () => {
      if (current === step.id) {
        feedback.textContent = "That matches the documented path for this step.";
        playTone("ok");
        stepIndex = Math.min(HUB_STEPS.length, stepIndex + 1);
        localStorage.setItem("webexlab.hubStep", String(stepIndex));
        onProgress?.(stepIndex, HUB_STEPS.length);
        if (stepIndex >= HUB_STEPS.length) {
          feedback.textContent = "Walkthrough complete. You can start again from Overview.";
          stepIndex = 0;
          localStorage.setItem("webexlab.hubStep", "0");
        }
        renderMain();
      } else {
        feedback.textContent = `Not yet. This step is ${step.nav}.`;
        playTone("bad");
      }
    });
    coach.append(ch, cp, check, feedback);
    main.append(coach);
  }

  renderNav();
  renderMain();
}

export function destroyStudio() {
  stopFlow();
}

function studioIntro(title, text) {
  const box = document.createElement("div");
  if (!title) {
    const p = document.createElement("p");
    p.className = "lede";
    p.textContent = "Four practice tools. Each one stays inside a single view so the page does not mount the whole curriculum.";
    box.append(p);
    return box;
  }
  const p = document.createElement("p");
  p.className = "lede";
  p.textContent = text;
  box.append(p);
  if (title.includes("Dial")) {
    const a = document.createElement("a");
    a.href = DIAL_CITES.trunks;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "Trunks, route groups, and dial plans";
    box.append(a);
  }
  return box;
}

function toolCard(title, text, href) {
  const a = document.createElement("a");
  a.className = "card";
  a.href = href;
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = text;
  a.append(h, p);
  return a;
}

function field(labelText, name, value, type = "text") {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.name = name;
  input.type = type;
  input.value = value;
  if (type === "number") input.min = "0";
  label.append(input);
  return label;
}

function selectField(labelText, name, options, value) {
  const label = document.createElement("label");
  label.textContent = labelText;
  const select = document.createElement("select");
  select.name = name;
  for (const [val, text] of options) {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = text;
    if (val === value) opt.selected = true;
    select.append(opt);
  }
  label.append(select);
  return label;
}

function miniSelect(name, options, value) {
  const select = document.createElement("select");
  select.name = name;
  select.setAttribute("aria-label", name);
  for (const [val, text] of options) {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = text;
    if (val === value) opt.selected = true;
    select.append(opt);
  }
  return select;
}

function action(label, fn) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn";
  b.textContent = label;
  b.addEventListener("click", fn);
  return b;
}

function note(text, kind) {
  const p = document.createElement("p");
  p.className = `callout ${kind || ""}`;
  p.textContent = text;
  return p;
}
