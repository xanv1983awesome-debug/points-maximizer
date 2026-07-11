// offline cache — the calculator must work inside a store with weak signal
const C = 'pm-v17';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './lego-db.json', './zxing.min.js',
    './manifest.json', './icon-abacus3-192.png', './icon-abacus3-512.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  // lego-db.json: stale-while-revalidate — serve the cached copy instantly
  // (works offline in-store), refresh it in the background when online
  if (e.request.url.endsWith('lego-db.json')) {
    e.respondWith(caches.open(C).then(c => c.match(e.request).then(r => {
      const net = fetch(e.request).then(nr => { c.put(e.request, nr.clone()); return nr; }).catch(() => r);
      return r || net;
    })));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
