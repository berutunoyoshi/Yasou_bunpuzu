// 野草分布図 オフライン用キャッシュ
// アプリを更新したら VERSION の数字を変えてください
const VERSION = 'v2';
const CACHE = 'yasou-' + VERSION;
const FILES = ['./', 'index.html', 'base.png', 'manifest.json', 'icon-180.png', 'icon-512.png', 'seed.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || new Response('オフラインです', { status: 503 });
    })
  );
});
