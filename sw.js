/* Japon 2026 — service worker : le site reste utilisable hors connexion.
   Fichiers du site et données : réseau d'abord (les modifications des JSON sont vues tout de suite),
   copie locale si pas de réseau. Polices et tuiles de carte déjà vues : copie locale d'abord. */
const VERSION = 'japon-v2-3';
const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/css/style.css',
  'assets/js/core.js', 'assets/js/art.js', 'assets/js/fx.js', 'assets/js/home.js', 'assets/js/itinerary.js', 'assets/js/activities.js',
  'assets/js/map.js', 'assets/js/tools.js', 'assets/js/editor.js', 'assets/js/app.js',
  'assets/vendor/leaflet/leaflet.js', 'assets/vendor/leaflet/leaflet.css',
  'assets/img/icon.svg', 'assets/img/icon-180.png', 'assets/img/icon-192.png', 'assets/img/icon-512.png',
  'data/voyage.json', 'data/villes.json', 'data/categories.json', 'data/hebergements.json',
  'data/jours.json', 'data/trajets.json', 'data/checklist.json',
];
const TILE_CACHE = 'japon-tiles';
const MAX_TILES = 800;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== TILE_CACHE && k !== 'japon-fonts').map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req.mode === 'navigate' ? req.url : req, { cache: 'no-cache' });
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') return cache.match('index.html');
    throw err;
  }
}

async function cacheFirst(req, name, max) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) {
    cache.put(req, res.clone());
    if (max) cache.keys().then((keys) => { if (keys.length > max) keys.slice(0, keys.length - max).forEach((k) => cache.delete(k)); });
  }
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) { e.respondWith(networkFirst(req)); return; }
  if (/tile\.openstreetmap\.org$/.test(url.hostname)) { e.respondWith(cacheFirst(req, TILE_CACHE, MAX_TILES)); return; }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { e.respondWith(cacheFirst(req, 'japon-fonts')); }
});
