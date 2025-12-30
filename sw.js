const CACHE_NAME = "rde-cache-v1";
const urlsToCache = [
  "./index.html",              
  "./view/index.html",         
  "./view/Modelo/rde-modelo.html",
  "./view/Modelo/rde-style.css",
  "./view/styles.css",
  "./controller/main.js",
  "./controller/rde-com.js",
  "./controller/html2pdf.bundle.min.js",
  "./controller/rde-rep.js",
  "./controller/controller.js",
  "./view/index-reparo.html",
  "./view/Modelo/rde-reparo.html",
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
