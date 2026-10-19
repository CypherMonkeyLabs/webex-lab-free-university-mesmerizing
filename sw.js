/* Offline shell for the Webex university. Same-origin GET only. */
var CACHE = "webex-university-v28";
var SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./start.html",
  "./help.html",
  "./play.html",
  "./labs.html",
  "./sip-sim.html",
  "./ports.html",
  "./downloads.html",
  "./glossary.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./favicon.ico",
  "./rooms/T1-R01-control-hub-foundations.html",
  "./assets/css/canon.css",
  "./assets/css/shell.css",
  "./assets/css/frame.css",
  "./assets/css/footer.css",
  "./assets/css/polish.css",
  "./assets/js/frame.js",
  "./assets/js/brand.js",
  "./assets/js/polish.js",
  "./assets/js/shell.js",
  "./assets/js/canon.js",
  "./assets/js/university.js",
  "./assets/js/search-index.js",
  "./assets/js/redesign.js",
  "./assets/js/study-index.js",
  "./assets/js/hero-boot.js",
  "./assets/js/phone-nav.js",
  "./assets/js/onboard.js",
  "./guide/guide.js",
  "./guide/guide.css",
  "./guide/engine.mjs",
  "./guide/wxbot.js",
  "./guide/dragbot.js",
  "./shared/pybot-chat/engine.js",
  "./shared/pybot-chat/ui.js",
  "./shared/pybot-chat/chat.css",
  "./assets/data/wxbot-index.json",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
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
    }).catch(function () {
      if (hit) return hit;
      if (request.mode === "navigate") return caches.match("./offline.html");
      return Promise.reject(new Error("offline"));
    });
    return hit || network;
  }));
});
