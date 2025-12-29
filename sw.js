const CACHE_NAME = "rde-cache-v1";
const urlsToCache = [
  "/view/index.html",
  "/view/Modelo/rdeModelo.html",
  "/css/style.css",
  "/js/script.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
