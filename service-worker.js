const CACHE_NAME = "mots-cache-v1.0.1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",

  // Icônes PWA
  "./icone-192.png",
  "./icone-512.png"
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(FILES_CORE.map(f => new Request(f, { cache: 'reload' })))
        .then(() => {
          FILES_EXTRA.forEach((f) => {
            cache.add(new Request(f, { cache: 'reload' })).catch(() => {});
          });
        })
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html', { ignoreSearch: true })
        .then((response) =>
          response || fetch(e.request).catch(() => new Response('', { status: 404 }))
        )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true })
      .then((response) =>
        response || fetch(e.request).catch(() => new Response('', { status: 404 }))
      )
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'getVersion') {
    e.source.postMessage(CACHE);
  }
});
