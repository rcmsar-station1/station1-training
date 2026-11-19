// Heads Up Station 1: keeps a copy on the device so the tool opens with no signal.
// Online it always asks the network first (so a new version shows up as soon as it is published)
// and falls back to the saved copy if there is no answer within 4 seconds.
const CACHE = 'heads-up-station1';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const saved = () => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('./'));
  const fresh = fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; });
  const slow = new Promise(ok => setTimeout(ok, 4000)).then(saved);
  e.respondWith(Promise.race([fresh.catch(() => null), slow]).then(x => x || saved()).then(x => x || fresh));
});
