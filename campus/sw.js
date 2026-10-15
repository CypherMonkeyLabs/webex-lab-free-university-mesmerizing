const CACHE = "webex-lab-v1";
const SHELL = [
  "./",
  "./index.html",
  "./css/campus.css",
  "./manifest.webmanifest",
  "./js/app.js",
  "./js/audio.js",
  "./js/diagram.js",
  "./js/flow.js",
  "./js/dialplan.js",
  "./js/flowmodel.js",
  "./js/studio.js",
  "./js/topology.js",
  "./vendor/three/build/three.module.min.js",
  "./vendor/three/examples/jsm/controls/OrbitControls.js",
  "./data/catalog.json",
  "./data/search.json",
  "./data/bosses.json",
  "./data/interview.json",
  "./data/glossary.json",
  "./data/certs.json",
  "./data/sources.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.method === "GET") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))),
  );
});
