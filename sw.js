const CACHE_NAME = "rde-cache-v1";
const urlsToCache = [
  "./index.html",              
  "./view/index.html",         
  "./view/Modelo/rdeModelo.html",
  "./view/Modelo/rdeStyle.css",
  "./view/styles.css",
  "./controller/main.js",
  "./controller/rdeCom.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => console.log("Falhou ao cachear:", url, err))
        )
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
