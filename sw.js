const CACHE = 'boardland-v2.4.2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './vendor/pixi.min.js',
  './js/boardland-family.js',
  './assets/boardland_assets_manifest.json',
  './assets/icons/icon.png',
  './assets/icons/card-back.webp',
  './assets/pawns/dog-pawn.webp',
  './assets/pawns/cat-pawn.webp',
  './assets/pawns/rabbit-pawn.webp',
  './assets/pawns/bear-pawn.webp',
  './assets/rewards/sticker-star.webp',
  './assets/rewards/sticker-heart.webp',
  './assets/rewards/sticker-rainbow.webp',
  './assets/rewards/gift-box.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(ASSETS.map(asset => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
