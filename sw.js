// Velox Lite — service worker (app shell cache)
const CACHE = 'velox-v1';
const SHELL = [
  '/', '/index.html', '/plans.html', '/animations.html', '/code.html',
  '/velox-lite.html', '/config.js', '/logo.svg', '/icon-192.png', '/icon-512.png', '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // never cache AI calls
  if (url.pathname.startsWith('/api/') || url.origin.includes('pollinations') || url.origin.includes('openrouter')) return;
  if (e.request.method !== 'GET') return;
  // network-first for pages, cache fallback (so app opens offline)
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('/index.html')))
  );
});
