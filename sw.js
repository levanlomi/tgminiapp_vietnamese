const CACHE_NAME = 'tieng-viet-v14'; // <--- Изменяем версию кэша каждый раз при обновлении кода
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Установка воркера
self.addEventListener('install', (event) => {
  self.skipWaiting(); // <--- Заставляем новый воркер сразу вытеснить старый в памяти телефона
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return fetch(url, { cache: 'reload' })
            .then(response => {
              if (response.ok) return cache.put(url, response);
              throw new Error(`Failed to fetch ${url}`);
            })
            .catch(err => console.warn('Install caching warning:', err));
        })
      );
    })
  );
});

// Активация и удаление старого кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // <--- Немедленно берем управление над открытыми страницами
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('translate.google.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});