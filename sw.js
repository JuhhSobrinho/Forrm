// Estratégia "rede primeiro": sempre busca a versão mais nova no servidor e
// guarda uma cópia; o cache só é usado quando estiver sem internet.
// Assim o app se atualiza sozinho, sem precisar limpar o cache.
const CACHE_NAME = "rde-cache-v3";
const urlsToCache = [
  "./index.html",
  "./manifest.json",
  "./view/index.html",
  "./view/index-reparo.html",
  "./view/index-rdo.html",
  "./view/styles.css",
  "./view/modelo/rde-modelo.html",
  "./view/modelo/rde-reparo.html",
  "./view/modelo/rdo-modelo.html",
  "./view/modelo/rde-style.css",
  "./controller/main.js",
  "./controller/controller.js",
  "./controller/main-rdo.js",
  "./controller/rde-com.js",
  "./controller/rde-rep.js",
  "./controller/rdo.js",
  "./controller/form-extras.js",
  "./controller/sw-register.js",
  "./controller/html2pdf.bundle.min.js",
  "./icons/tisi.png",
  "./icons/team.png"
];

self.addEventListener("install", event => {
  // Ativa a versão nova na hora, sem esperar fechar todas as abas
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        urlsToCache.map(url =>
          cache.add(new Request(url, { cache: "reload" }))
            .catch(err => console.log("Falhou ao cachear:", url, err))
        )
      )
    )
  );
});

// Remove caches de versões anteriores e assume o controle das abas abertas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Navegações não aceitam resposta "redirecionada" vinda do service worker
function semRedirect(response) {
  if (!response.redirected) return response;
  return response.blob().then(body =>
    new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers })
  );
}

self.addEventListener("fetch", event => {
  const { request } = event;

  // Só GET (o envio para o Google Sheets é POST e passa direto)
  if (request.method !== "GET") return;

  const mesmaOrigem = new URL(request.url).origin === self.location.origin;

  event.respondWith(
    // "no-cache" faz o navegador conferir com o servidor se há versão nova
    (mesmaOrigem ? fetch(request.url, { cache: "no-cache" }) : fetch(request))
      .then(semRedirect)
      .then(response => {
        if (response && (response.ok || response.type === "opaque")) {
          const copia = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copia));
        }
        return response;
      })
      .catch(() =>
        caches.match(request, { ignoreSearch: true }).then(r => r || Response.error())
      )
  );
});
