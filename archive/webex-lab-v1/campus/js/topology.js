import * as THREE from "../vendor/three/build/three.module.min.js";
import { OrbitControls } from "../vendor/three/examples/jsm/controls/OrbitControls.js";

const NODES = [
  { id: "hub", name: "Control Hub", detail: "Admin portal for the organization.", pos: [0, 2.3, 0], color: 0x3ddc97, cite: "https://help.webex.com/en-us/article/njvdjf2/Configure-Webex-Calling-for-your-organization" },
  { id: "calling", name: "Webex Calling", detail: "Multi-tenant calling.", pos: [-2.5, 0.7, 0.6], color: 0x5ee7ff, cite: "https://help.webex.com/article/32gfts/Webex-Calling-Configuration-Workflow" },
  { id: "di", name: "Dedicated Instance", detail: "Private Unified CM, Unity Connection, Expressway, and regional CER.", pos: [2.6, 0.8, 0.2], color: 0xc4b5fd, cite: "https://help.webex.com/en-us/article/dk3o5r/Introduction-to-Dedicated-Instance" },
  { id: "wxcc", name: "Contact Center", detail: "Flows, queues, and the agent desktop.", pos: [0.2, 0.5, -2.5], color: 0xf5c16c, cite: "https://help.webex.com/en-us/article/np2fdx/Understand-Routing-and-Queueing-in-Webex-Contact-Center" },
  { id: "lgw", name: "Local Gateway", detail: "CUBE or a supported SBC. Certificate trunk uses TCP 5062. Registration trunk uses TCP 8934.", pos: [-3.6, -1.3, 1.4], color: 0x3ddc97, cite: "https://help.webex.com/article/b2exve/Port-Reference-Information-for-Webex-Calling" },
  { id: "pstn", name: "Cloud PSTN", detail: "Cisco Calling Plan or Cloud Connected PSTN.", pos: [-1.1, -1.6, 2.4], color: 0xf5c16c, cite: "https://help.webex.com/en-us/article/n0xb944/Configure-trunks,-route-groups,-and-dial-plans-for-Webex-Calling" },
  { id: "redsky", name: "RedSky / Intrado", detail: "Enhanced emergency calling for enabled US and Canada locations.", pos: [1.5, -1.5, 2.2], color: 0xff8b7a, cite: "https://help.webex.com/en-us/article/av6oo3" },
  { id: "cucm", name: "On-prem Unified CM", detail: "Migration source. Normalize to +E.164 toward the local gateway.", pos: [3.8, -1.3, 1.1], color: 0x8eb6ff, cite: "https://help.webex.com/en-us/article/4yz2zd/Prepare-to-migrate-from-Unified-CM-to-Webex-Calling" },
  { id: "devices", name: "Devices", detail: "MPP phones and RoomOS devices.", pos: [0.3, -1.7, -0.2], color: 0x7dffe1, cite: "https://developer.webex.com/devices/docs/api/guides/device-developers-guide" },
  { id: "app", name: "Webex App", detail: "HELD+ client. Media optimization uses UDP 8500-8699 when ICE succeeds.", pos: [-1.8, -0.1, -1.8], color: 0x5ee7ff, cite: "https://help.webex.com/article/b2exve/Port-Reference-Information-for-Webex-Calling" },
  { id: "ai", name: "AI Agent Studio", detail: "Scripted and autonomous agents, reached from Virtual Agent V2 or the digital AI Agent node.", pos: [2.0, 0.2, -2.6], color: 0xf0abfc, cite: "https://help.webex.com/en-us/article/s0qro1/Use-AI-agents-for-customer-interactions" },
  { id: "wfo", name: "Webex WFO", detail: "Workforce management, quality management, and analytics.", pos: [-2.0, 1.4, -2.3], color: 0xffd27a, cite: "https://help.webex.com/landing/ld-nf7q1hbb-WebexWorkforceOptimization(WFO)/Agents?subTab=Webex-Contact-Center&type=complex" },
];

const LINKS = [
  ["hub", "calling"], ["hub", "di"], ["hub", "wxcc"], ["hub", "devices"],
  ["calling", "lgw"], ["calling", "pstn"], ["calling", "redsky"], ["calling", "di"],
  ["calling", "app"], ["calling", "devices"], ["lgw", "cucm"], ["di", "cucm"],
  ["wxcc", "calling"], ["wxcc", "ai"], ["wxcc", "wfo"],
];

export const FAILURES = [
  { id: "cert", label: "Certificate trunk TCP 5062 blocked", links: [["calling", "lgw"]], detail: "Certificate-based trunks signal to Webex Calling on TCP 5062. Registration-based trunks use TCP 8934. Blocking 5062 drops the certificate trunk." },
  { id: "reg", label: "Registration trunk TCP 8934 blocked", links: [["calling", "lgw"]], detail: "The port reference lists TCP 8934 for registration-based trunks. A certificate trunk on 5062 is a different socket." },
  { id: "held", label: "RedSky HELD unreachable", links: [["calling", "redsky"]], detail: "HELD-capable phones and the Webex App need HTTPS on port 443 to the RedSky hosts named in the emergency calling article. Until a phone resyncs, it does not start using HELD." },
  { id: "interop", label: "DI interop SIP trunk down", links: [["calling", "di"]], detail: "Activation builds SIP connectivity between Dedicated Instance and multi-tenant Webex Calling, and you still activate the interop trunk." },
  { id: "cloudpstn", label: "Cloud PSTN path down", links: [["calling", "pstn"]], detail: "Cisco Calling Plan and Cloud Connected PSTN are the cloud PSTN choices. Premises users still cannot borrow that path." },
  { id: "media", label: "Optimized media ports blocked", links: [["calling", "app"], ["calling", "devices"]], detail: "When ICE succeeds, Webex App media can go direct on UDP 8500-8699 and devices on 19560-19661. Firewalls inside the site have to allow those ranges." },
  { id: "mra", label: "Expressway path from DI dark", links: [["di", "cucm"]], detail: "Expressway provides Mobile and Remote Access for Dedicated Instance. This toggle marks that path failed. It does not simulate a real Expressway." },
  { id: "queue", label: "Contact center voice path interrupted", links: [["wxcc", "calling"]], detail: "Webex Contact Center voice uses Webex Calling, a local gateway, or Cloud Connected PSTN. If that path is down, flows still run but calls do not reach agents." },
];

let cleanup = () => {};

export function destroyTopology() {
  cleanup();
  cleanup = () => {};
}

export function mountTopology(host, reduceMotion) {
  destroyTopology();
  const layout = document.createElement("div");
  layout.className = "topo-layout";
  const stage = document.createElement("div");
  stage.className = "topo-stage";
  const side = document.createElement("div");
  side.className = "panel stack";
  layout.append(stage, side);
  host.append(layout);

  const failed = new Set();
  let selected = NODES[0];

  function linkKey(a, b) {
    return [a, b].sort().join("|");
  }

  function failedKeys() {
    const keys = new Set();
    for (const item of FAILURES) {
      if (!failed.has(item.id)) continue;
      for (const pair of item.links) keys.add(linkKey(pair[0], pair[1]));
    }
    return keys;
  }

  function paintSide() {
    side.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = selected.name;
    const p = document.createElement("p");
    p.textContent = selected.detail;
    const a = document.createElement("a");
    a.href = selected.cite;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "Source";
    side.append(h, p, a);
    const h3 = document.createElement("h3");
    h3.textContent = "Failure toggles";
    side.append(h3);
    for (const item of FAILURES) {
      const label = document.createElement("label");
      label.className = "check";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = failed.has(item.id);
      input.addEventListener("change", () => {
        if (input.checked) failed.add(item.id);
        else failed.delete(item.id);
        paintSide();
        drawFallback();
        refreshLinks();
      });
      const span = document.createElement("span");
      span.textContent = item.label;
      label.append(input, span);
      side.append(label);
      if (failed.has(item.id)) {
        const note = document.createElement("p");
        note.className = "callout warn";
        note.textContent = item.detail;
        side.append(note);
      }
    }
  }

  const fallback = document.createElement("div");
  fallback.className = "topo-fallback";
  stage.append(fallback);

  function drawFallback() {
    if (!reduceMotion && glOk) {
      fallback.hidden = true;
      return;
    }
    fallback.hidden = false;
    fallback.replaceChildren(renderStaticMap(failedKeys(), (id) => {
      selected = NODES.find((node) => node.id === id) || selected;
      paintSide();
    }));
  }

  let glOk = false;
  let refreshLinks = () => {};
  paintSide();

  if (reduceMotion) {
    drawFallback();
    cleanup = () => fallback.replaceChildren();
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    drawFallback();
    return;
  }
  glOk = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(stage.clientWidth || 800, 520);
  renderer.domElement.setAttribute("aria-label", "Three-dimensional Webex topology. Drag to orbit. Failure toggles are in the side panel.");
  stage.prepend(renderer.domElement);
  fallback.hidden = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07120f, 0.045);
  const camera = new THREE.PerspectiveCamera(48, (stage.clientWidth || 800) / 520, 0.1, 100);
  camera.position.set(7.2, 4.4, 8.2);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.2, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x5ee7ff, 8, 20);
  rim.position.set(-4, 3, -2);
  scene.add(rim);

  const grid = new THREE.GridHelper(16, 16, 0x1e3a32, 0x143028);
  grid.position.y = -2.2;
  scene.add(grid);

  const meshes = new Map();
  const nodeGroup = new THREE.Group();
  for (const node of NODES) {
    const geo = new THREE.SphereGeometry(0.38, 28, 18);
    const mat = new THREE.MeshStandardMaterial({ color: node.color, roughness: 0.35, metalness: 0.15, emissive: node.color, emissiveIntensity: 0.25 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...node.pos);
    mesh.userData.id = node.id;
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.18 }));
    mesh.add(halo);
    nodeGroup.add(mesh);
    meshes.set(node.id, mesh);
  }
  scene.add(nodeGroup);

  const linkMats = [];
  function rebuildLinks() {
    for (const mat of linkMats) mat.dispose();
    linkMats.length = 0;
    const dead = failedKeys();
    const old = scene.getObjectByName("links");
    if (old) {
      scene.remove(old);
      old.traverse((obj) => obj.geometry?.dispose());
    }
    const group = new THREE.Group();
    group.name = "links";
    for (const [a, b] of LINKS) {
      const pa = meshes.get(a).position;
      const pb = meshes.get(b).position;
      const broken = dead.has(linkKey(a, b));
      const geo = new THREE.BufferGeometry().setFromPoints([pa, pb]);
      const mat = new THREE.LineBasicMaterial({ color: broken ? 0xff5d5d : 0x8ef0c8, transparent: true, opacity: broken ? 0.35 : 0.85 });
      linkMats.push(mat);
      group.add(new THREE.Line(geo, mat));
    }
    scene.add(group);
  }
  refreshLinks = rebuildLinks;
  rebuildLinks();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([...meshes.values()]);
    if (!hits.length) return;
    selected = NODES.find((node) => node.id === hits[0].object.userData.id) || selected;
    paintSide();
  }
  renderer.domElement.addEventListener("click", onClick);

  let frame = 0;
  let running = true;
  const clock = new THREE.Clock();
  function tick() {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    nodeGroup.rotation.y = t * 0.08;
    controls.update();
    renderer.render(scene, camera);
  }
  tick();

  const onResize = () => {
    const w = stage.clientWidth || 800;
    camera.aspect = w / 520;
    camera.updateProjectionMatrix();
    renderer.setSize(w, 520);
  };
  window.addEventListener("resize", onResize);

  cleanup = () => {
    running = false;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", onResize);
    renderer.domElement.removeEventListener("click", onClick);
    controls.dispose();
    renderer.dispose();
    scene.traverse((obj) => {
      obj.geometry?.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  };
  drawFallback();
}

function renderStaticMap(dead, onPick) {
  const figure = document.createElement("figure");
  figure.className = "static-map";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 760 520");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Still topology used when motion is reduced or WebGL is unavailable");
  const positions = {
    hub: [380, 70], calling: [180, 180], di: [560, 170], wxcc: [380, 250],
    lgw: [80, 340], pstn: [230, 400], redsky: [400, 410], cucm: [640, 360],
    devices: [300, 320], app: [140, 250], ai: [520, 300], wfo: [250, 90],
  };
  for (const [a, b] of LINKS) {
    const pa = positions[a];
    const pb = positions[b];
    const broken = dead.has([a, b].sort().join("|"));
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", pa[0]);
    line.setAttribute("y1", pa[1]);
    line.setAttribute("x2", pb[0]);
    line.setAttribute("y2", pb[1]);
    line.setAttribute("stroke", broken ? "#ff5d5d" : "#3ddc97");
    line.setAttribute("stroke-width", "2");
    svg.append(line);
  }
  const wrap = document.createElement("div");
  wrap.className = "static-hit";
  for (const node of NODES) {
    const [x, y] = positions[node.id];
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", "16");
    c.setAttribute("fill", "#10211c");
    c.setAttribute("stroke", "#3ddc97");
    svg.append(c);
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x + 20);
    t.setAttribute("y", y + 4);
    t.setAttribute("fill", "currentColor");
    t.textContent = node.name;
    svg.append(t);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "map-btn";
    btn.style.left = `${(x / 760) * 100}%`;
    btn.style.top = `${(y / 520) * 100}%`;
    btn.textContent = node.name;
    btn.addEventListener("click", () => onPick(node.id));
    wrap.append(btn);
  }
  figure.append(svg);
  const cap = document.createElement("figcaption");
  cap.textContent = "Reduced-motion map. Select a node, then use the failure toggles. Broken links turn red.";
  figure.append(cap, wrap);
  return figure;
}
