// Service Worker para MentalCheck PWA
const CACHE_NAME = 'mentalcheck-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/mentalcheck',
  '/checkin-rapido',
  '/manejo-crisis',
  '/tecnicas-respiracion',
  '/mindfulness-express',
  '/evaluacion-profunda'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('MentalCheck SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('MentalCheck SW: Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('MentalCheck SW: Recursos cacheados exitosamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('MentalCheck SW: Error cacheando recursos:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('MentalCheck SW: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('MentalCheck SW: Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('MentalCheck SW: Tomando control de clientes');
      return self.clients.claim();
    })
  );
});

// Interceptar fetch requests
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Estrategia: Cache First para recursos estáticos, Network First para API calls
  if (event.request.url.includes('/api/')) {
    // Network First para API calls
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Solo cachear respuestas exitosas para ciertas rutas de API
          if (response.status === 200 && 
              (event.request.url.includes('/api/techniques') || 
               event.request.url.includes('/api/breathing-exercises'))) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar desde cache
          return caches.match(event.request);
        })
    );
  } else {
    // Cache First para recursos estáticos
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Si está en cache, devolverlo
          if (response) {
            return response;
          }
          
          // Si no está en cache, intentar de la red
          return fetch(event.request)
            .then((response) => {
              // Solo cachear respuestas válidas
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clonar la respuesta porque es un stream
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // Si falla todo, devolver página offline para navegación
              if (event.request.destination === 'document') {
                return caches.match('/');
              }
            });
        })
    );
  }
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({version: CACHE_NAME});
  }
});

// Manejar errores
self.addEventListener('error', (event) => {
  console.error('MentalCheck SW: Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('MentalCheck SW: Promise rechazada:', event.reason);
});