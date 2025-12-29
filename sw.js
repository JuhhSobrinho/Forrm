const CACHE_NAME = "rde-cache-v1";
const urlsToCache = [
  "/Forrm/index.html",              // splash
  "/Forrm/view/index.html",         // formulário
  "/Forrm/view/Modelo/rdeModelo.html",
  "/Forrm/css/style.css",
  "/Forrm/controller/main.js",
  "/Forrm/controller/rdeCom.js"
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
