// 野草分布図 オフライン用キャッシュ
// アプリを更新したら VERSION を変えてください（スタート画面に「新しいバージョンがあります」と表示されます）
const VERSION = 'v3.4';
const CACHE = 'yasou-' + VERSION;
const FILES = ['./', 'index.html', 'base.png', 'seed.json', 'manifest.json', 'icon-180.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))));
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const r = await fetch(e.request);
        if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone());
        return r;
      } catch (err) { return new Response('オフラインです', { status: 503 }); }
    })
  );
});
