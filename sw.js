/* Offline shell for the Webex university. Same-origin GET only. */
var CACHE = "webex-university-v21";
var SHELL = [
  "./",
  "./index.html",
  "./start.html",
  "./downloads.html",
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
  "./assets/js/phone-nav.js",
  "./assets/js/onboard.js",
  "./manifest.webmanifest",
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
