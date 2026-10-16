/* Offline shell for the Webex university. Same-origin GET only. */
var CACHE = "webex-university-v20";
var SHELL = [
  "./",
  "./index.html",
  "./start.html",
  "./resources.html",
  "./mastery.html",
  "./ports.html",
  "./play.html",
  "./downloads.html",
  "./ecosystem.html",
  "./ecosystem-atlas.html",
  "./diagrams.html",
  "./flows.html",
  "./charts.html",
  "./careers.html",
  "./assets/js/effects.js",
  "./assets/css/canon.css",
  "./assets/css/shell.css",
  "./assets/css/university.css",
  "./assets/css/wow.css",
  "./assets/css/frame.css",
  "./assets/js/frame.js",
  "./assets/css/footer.css",
  "./assets/css/polish.css",
  "./assets/js/brand.js",
  "./assets/js/polish.js",
  "./assets/data/socials.json",
  "./assets/data/downloads.json",
  "./assets/js/wow.js",
  "./assets/js/room-i18n.js",
  "./assets/js/track-icons.js",
  "./assets/js/page-backdrop.js",
  "./assets/js/hero-scene.js",
  "./regions.html",
  "./vendor/three.module.min.js",
  "./assets/js/shell.js",
  "./assets/js/canon.js",
  "./assets/js/university.js",
  "./assets/js/phone-nav.js",
  "./assets/js/guide-kb.js",
  "./assets/js/guide-bot.js",
  "./assets/data/guide-kb.json",
  "./guide/guide.js",
  "./guide/guide.css",
  "./guide/engine.mjs",
  "./help.html",
  "./legal.html",
  "./manifest.webmanifest",
  "./assets/js/onboard.js",
  "./assets/js/studio.js",
  "./assets/js/export-doc.mjs",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/js/search-index.js",
  "./assets/js/study-index.js",
  "./favicon.svg",
  "./favicon.ico"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE; }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(function (hit) {
    var network = fetch(request).then(function (response) {
      if (response && response.ok && response.type === "basic") {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
      }
      return response;
    }).catch(function () { return hit; });
    return hit || network;
  }));
});
