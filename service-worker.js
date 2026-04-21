const CACHE = "mots-cache-multi-x-v1.2.9";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icone-192.png",
  "./icone-512.png"
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(ASSETS.map(f => new Request(f, { cache: 'reload' })))
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
    var url = new URL(e.request.url);
    var page = url.pathname.split('/').pop() || 'index.html';
    if (!page.endsWith('.html')) page = 'index.html';
    e.respondWith(
      caches.match('./' + page, { ignoreSearch: true })
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
