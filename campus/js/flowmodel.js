/** Teaching model of Webex Contact Center Flow Designer activities. Not a Control Hub import file. */

export const FLOW_CITE = "https://help.webex.com/en-us/article/nhovcy4/Build-and-manage-flows-with-Flow-Designer";
export const ROUTE_CITE = "https://help.webex.com/en-us/article/np2fdx/Understand-Routing-and-Queueing-in-Webex-Contact-Center";
export const AI_CITE = "https://help.webex.com/en-us/article/s0qro1/Use-AI-agents-for-customer-interactions";

export const ACTIVITIES = [
  { type: "start", title: "Start Flow", blurb: "Opens the main flow. Event flows are separate from this path.", ports: ["out"] },
  { type: "hours", title: "Business Hours", blurb: "Branches on the contact center schedule.", ports: ["open", "closed"] },
  { type: "play", title: "Play Message", blurb: "Plays a configured audio file or prompt.", ports: ["out"] },
  { type: "music", title: "Play Music", blurb: "Plays music while the contact waits.", ports: ["out"] },
  { type: "menu", title: "Menu", blurb: "Collects a menu digit. Unmatched input uses the timeout or unmatched port if you connect one.", ports: ["1", "2", "other"] },
  { type: "digits", title: "Collect Digits", blurb: "Collects digits such as an account number.", ports: ["out"] },
  { type: "condition", title: "Condition", blurb: "Branches on a variable you set earlier in the flow.", ports: ["true", "false"] },
  { type: "http", title: "HTTP Request", blurb: "Data dip. Cisco publishes templates for Salesforce, Dynamics, ServiceNow, and Zendesk.", ports: ["success", "error"] },
  { type: "va", title: "Virtual Agent V2", blurb: "Voice AI agent activity. Escalation returns control to the flow with metadata.", ports: ["done", "escalated"] },
  { type: "queue", title: "Queue Contact", blurb: "Queues the contact to a queue. Routing inside the queue can be LAA or BAA.", ports: ["out"] },
  { type: "agent", title: "Queue To Agent", blurb: "Queues to a preferred agent by agent id or email.", ports: ["out"] },
  { type: "pop", title: "Screen Pop", blurb: "Presents data to the agent desktop when the contact is offered.", ports: ["out"] },
  { type: "callback", title: "Callback", blurb: "Offers a callback instead of waiting in queue.", ports: ["out"] },
  { type: "transfer", title: "Blind Transfer", blurb: "Transfers the contact and releases the flow.", ports: ["out"] },
  { type: "disconnect", title: "Disconnect Contact", blurb: "Ends the contact.", ports: [] },
];

export function activityByType(type) {
  return ACTIVITIES.find((row) => row.type === type) || ACTIVITIES[0];
}

export function emptyFlow() {
  return {
    name: "Main line",
    schema: "webex-lab-flow-1",
    note: "Teaching schema for this lab. It is not a file you can import into Control Hub.",
    nodes: [
      { id: "n1", type: "start", x: 40, y: 40, label: "Entry" },
      { id: "n2", type: "hours", x: 40, y: 150, label: "Schedule" },
      { id: "n3", type: "menu", x: 40, y: 270, label: "Main menu" },
      { id: "n4", type: "queue", x: 280, y: 270, label: "Support queue" },
      { id: "n5", type: "play", x: 280, y: 150, label: "Closed message" },
      { id: "n6", type: "disconnect", x: 280, y: 40, label: "End" },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2", when: "out" },
      { id: "e2", from: "n2", to: "n3", when: "open" },
      { id: "e3", from: "n2", to: "n5", when: "closed" },
      { id: "e4", from: "n5", to: "n6", when: "out" },
      { id: "e5", from: "n3", to: "n4", when: "1" },
    ],
  };
}

export function sampleContact() {
  return {
    hours: "open",
    menuDigit: "1",
    condition: "true",
    http: "success",
    va: "escalated",
  };
}

function portFor(node, contact) {
  switch (node.type) {
    case "hours":
      return contact.hours === "closed" ? "closed" : "open";
    case "menu":
      return contact.menuDigit === "1" || contact.menuDigit === "2" ? contact.menuDigit : "other";
    case "condition":
      return contact.condition === "false" ? "false" : "true";
    case "http":
      return contact.http === "error" ? "error" : "success";
    case "va":
      return contact.va === "done" ? "done" : "escalated";
    default:
      return "out";
  }
}

export function simulateFlow(flow, contact) {
  const nodes = new Map(flow.nodes.map((node) => [node.id, node]));
  const start = flow.nodes.find((node) => node.type === "start");
  const steps = [];
  if (!start) {
    return { ok: false, steps: [{ title: "Missing Start Flow", detail: "Add a Start Flow activity. Cisco documents Start Flow as the beginning of the main flow.", cite: FLOW_CITE }] };
  }
  let current = start;
  const seen = new Set();
  for (let guard = 0; guard < 24; guard += 1) {
    if (seen.has(current.id)) {
      steps.push({ title: "Loop stopped", detail: "The teaching simulator stopped because the path visited the same activity twice.", cite: FLOW_CITE, nodeId: current.id });
      return { ok: false, steps };
    }
    seen.add(current.id);
    const meta = activityByType(current.type);
    const chosen = portFor(current, contact);
    steps.push({
      title: `${meta.title}: ${current.label || meta.title}`,
      detail: describe(current, chosen, contact),
      cite: current.type === "va" ? AI_CITE : current.type === "queue" || current.type === "agent" ? ROUTE_CITE : FLOW_CITE,
      nodeId: current.id,
      port: chosen,
    });
    if (current.type === "disconnect" || current.type === "transfer") {
      return { ok: true, steps };
    }
    const edge = flow.edges.find((row) => row.from === current.id && row.when === chosen)
      || flow.edges.find((row) => row.from === current.id && row.when === "out");
    if (!edge) {
      steps.push({
        title: "No outgoing connection",
        detail: `Nothing is connected from the "${chosen}" port. Connect that port or change the test contact.`,
        cite: FLOW_CITE,
        nodeId: current.id,
      });
      return { ok: false, steps };
    }
    const next = nodes.get(edge.to);
    if (!next) {
      steps.push({ title: "Broken connection", detail: "The connection points at a missing activity.", cite: FLOW_CITE });
      return { ok: false, steps };
    }
    current = next;
  }
  steps.push({ title: "Step limit", detail: "Stopped after 24 activities.", cite: FLOW_CITE });
  return { ok: false, steps };
}

function describe(node, port, contact) {
  switch (node.type) {
    case "start":
      return "The contact enters the main flow. Event flows such as AgentOffered are not this path.";
    case "hours":
      return `Business Hours took the "${port}" branch for this test contact.`;
    case "menu":
      return `Menu received digit "${contact.menuDigit || ""}" and took the "${port}" port.`;
    case "play":
      return "Play Message would play the prompt configured on this activity.";
    case "music":
      return "Play Music would play the waiting treatment.";
    case "digits":
      return "Collect Digits would store the collected string in a flow variable.";
    case "condition":
      return `Condition evaluated ${port}.`;
    case "http":
      return `HTTP Request took the "${port}" port. Use this for a CRM data dip, then Parse the body before you branch.`;
    case "va":
      return port === "escalated"
        ? "Virtual Agent V2 returned on the escalated path. The flow can read metadata such as the previous intent and choose a queue."
        : "Virtual Agent V2 completed without escalation.";
    case "queue":
      return "Queue Contact places the contact in the selected queue. Longest Available Agent or Best Available Agent is configured on the queue, not on this activity alone.";
    case "agent":
      return "Queue To Agent looks up a preferred agent by id or email.";
    case "pop":
      return "Screen Pop sends the configured information to the agent desktop.";
    case "callback":
      return "Callback offers a return call. Cisco also documents scheduled callback subflows.";
    case "transfer":
      return "Blind Transfer sends the contact to the configured destination and leaves the flow.";
    case "disconnect":
      return "Disconnect Contact ends the interaction.";
    default:
      return "Activity ran.";
  }
}
