const CACHE='house-v1.1';
const ASSETS=[
'/', '/index.html', '/styles.css', '/app.js', '/characters.json', '/manifest.json',
'/assets/icons/icon-192.png','/assets/icons/icon-512.png',
'/assets/avatars/grace.jpg','/assets/avatars/vesper.jpg','/assets/avatars/mika.jpg',
'/assets/avatars/em.jpg','/assets/avatars/rhea.jpg','/assets/avatars/morgan.jpg',
'/assets/avatars/ada.jpg','/assets/avatars/isla.jpg','/assets/avatars/seren.jpg',
'/assets/avatars/sasha.jpg','/assets/avatars/claire.jpg'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, clone));
      return response;
    }))
  );
});
