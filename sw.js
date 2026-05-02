const CACHE = 'pontoobra-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(ASSETS).catch(() => {}) // logo.png pode não existir ainda
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const network = fetch(e.request).then(res => {
          if (res && res.status === 200) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
