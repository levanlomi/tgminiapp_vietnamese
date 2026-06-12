const CACHE_NAME = 'tieng-viet-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Установка сервис-воркера и кэширование файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Используем force-запросы, чтобы не закэшировать битые файлы
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

// Активация воркера и очистка старого кэша
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
    })
  );
});

// Перехват сетевых запросов (для работы оффлайн)
self.addEventListener('fetch', (event) => {
  // Запросы к сторонней озвучке Google Translate не кэшируем, отправляем сразу в сеть
  if (event.request.url.includes('translate.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});