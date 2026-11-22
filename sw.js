// Service worker do site Treino: guarda o app no celular para abrir mesmo sem internet.
// Se um dia quiser forçar a atualização de todo mundo, troque o número da versão abaixo.
const V = 'treino-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  const mesmo = u.origin === location.origin;
  const fonte = /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname);
  if (!mesmo && !fonte) return; // Apps Script e o resto vão direto para a rede
  e.respondWith(caches.open(V).then(async c => {
    const guardado = await c.match(r, { ignoreSearch: true });
    const rede = fetch(r).then(res => {
      if (res.ok || res.type === 'opaque') c.put(r, res.clone());
      return res;
    }).catch(() => guardado);
    return guardado || rede;
  }));
});
