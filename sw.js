// Offline cache so the games work on school Chromebooks without Wi-Fi after the first visit.
const CACHE = 'peachy-k-v5';
const FILES = ['./', 'index.html', 'style.css', 'ui.css', 'i18n.js', 'core.js', 'games-math.js', 'games-read.js', 'games-write.js', 'games-read2.js', 'games-math2.js', 'games-sci2.js', 'games-ga.js', 'games-sci.js', 'report-parse.js', 'profile.js', 'app.js', 'icon.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ch => ch.put(e.request, c)); return r; }).catch(() => caches.match(e.request))));
