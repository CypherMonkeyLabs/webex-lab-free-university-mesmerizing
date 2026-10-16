/* One shared WebGL renderer bakes a sprite per track, then every card reuses it. */
import * as THREE from "../../vendor/three.module.min.js";

var TRACKS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"];
var COLORS = {
  T1: 0x3ecfb2,
  T2: 0x7eb6ff,
  T3: 0xf0b429,
  T4: 0xff8b9a,
  T5: 0xc4b5fd,
  T6: 0xc6e27a,
  T7: 0xffb067,
  T8: 0xf0a0ff,
  T9: 0x34d399,
  T10: 0xa78bfa,
  T11: 0x38bdf8
};

function geometry(id) {
  if (id === "T1") return new THREE.BoxGeometry(1.05, 0.72, 1.05);
  if (id === "T2") return new THREE.CylinderGeometry(0.38, 0.42, 1.25, 18);
  if (id === "T3") return new THREE.TorusGeometry(0.52, 0.18, 12, 24);
  if (id === "T4") return new THREE.BoxGeometry(0.7, 1.2, 0.7);
  if (id === "T5") return new THREE.IcosahedronGeometry(0.72, 0);
  if (id === "T6") return new THREE.BoxGeometry(1.3, 0.48, 0.62);
  if (id === "T7") return new THREE.OctahedronGeometry(0.78, 0);
  if (id === "T8") return new THREE.TetrahedronGeometry(0.86, 0);
  if (id === "T9") return new THREE.SphereGeometry(0.62, 20, 16);
  if (id === "T10") return new THREE.ConeGeometry(0.55, 1.15, 18);
  if (id === "T11") return new THREE.TorusKnotGeometry(0.42, 0.14, 64, 8);
  return new THREE.TetrahedronGeometry(0.86, 0);
}

function bake() {
  var urls = {};
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  } catch (err) {
    return urls;
  }
  renderer.setSize(160, 160);
  var mobile = window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(1.8, 1.35, 2.5);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  var key = new THREE.PointLight(0xffffff, 12, 16);
  key.position.set(2, 3, 2);
  scene.add(key);
  var rim = new THREE.PointLight(0xf472b6, 6, 12);
  rim.position.set(-2, 0.4, -1);
  scene.add(rim);
  TRACKS.forEach(function (id) {
    var geo = geometry(id);
    var mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: COLORS[id],
      emissive: COLORS[id],
      emissiveIntensity: 0.45,
      metalness: 0.35,
      roughness: 0.28
    }));
    mesh.rotation.set(0.35, 0.7, 0.1);
    scene.add(mesh);
    renderer.render(scene, camera);
    urls[id] = renderer.domElement.toDataURL("image/png");
    scene.remove(mesh);
    geo.dispose();
    mesh.material.dispose();
  });
  renderer.dispose();
  return urls;
}

function trackOf(node) {
  var coded = node.getAttribute && node.getAttribute("data-code");
  if (coded) return coded.slice(0, 2);
  var body = document.body.getAttribute("data-track");
  if (body && node.classList && node.classList.contains("stage-banner")) return body;
  var tile = node.closest && node.closest("[data-track], .track-tile, .track-card");
  if (tile && tile.getAttribute("data-track")) return tile.getAttribute("data-track");
  var href = "";
  var link = node.querySelector ? node.querySelector("a[href*='tracks/T']") : null;
  if (!link && node.closest) link = node.closest("a[href*='tracks/T']");
  if (link) href = link.getAttribute("href") || "";
  var match = href.match(/T[1-8]/);
  if (match) return match[0];
  var card = node.closest && node.closest(".track-card, .track-tile");
  if (card) {
    var index = Array.prototype.indexOf.call(document.querySelectorAll(card.classList.contains("track-tile") ? ".track-tile" : ".track-card"), card);
    if (index >= 0) return "T" + (index + 1);
  }
  return "T1";
}

function place(urls) {
  document.querySelectorAll(".tile-art").forEach(function (slot) {
    var id = trackOf(slot);
    slot.innerHTML = '<img class="gl-sprite" alt="" width="84" height="84" src="' + urls[id] + '">';
  });
  document.querySelectorAll(".track-card header > div").forEach(function (slot) {
    if (slot.querySelector(".gl-sprite")) return;
    var id = trackOf(slot);
    slot.insertAdjacentHTML("afterbegin", '<img class="gl-sprite" alt="" width="84" height="84" src="' + urls[id] + '">');
  });
  document.querySelectorAll(".room-row").forEach(function (row) {
    var code = row.querySelector(".room-code");
    if (!code || code.querySelector(".gl-sprite")) return;
    var id = (row.getAttribute("data-code") || "T1").slice(0, 2);
    code.insertAdjacentHTML("afterbegin", '<img class="gl-sprite" alt="" width="36" height="36" src="' + (urls[id] || urls.T1) + '">');
  });
  var banner = document.querySelector(".stage-banner");
  if (banner && !banner.querySelector(".gl-sprite")) {
    var id = document.body.getAttribute("data-track") || "T1";
    if (urls[id]) banner.insertAdjacentHTML("beforeend", '<img class="gl-sprite" alt="" width="96" height="96" src="' + urls[id] + '">');
  }
}

function start() {
  var urls = bake();
  if (!urls.T1) return;
  place(urls);
  document.addEventListener("canon-theme", function () { place(bake()); });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
