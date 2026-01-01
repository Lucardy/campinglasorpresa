const CACHE_NAME = 'camping-la-sorpresa-v2.1-' + Date.now();
const urlsToCache = [
  '/',
  '/camping',
  '/cabanas',
  '/dormis',
  '/contact',
  '/gallery',
  '/services',
  '/about',
  '/logo.jpeg',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache abierto:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Error al instalar cache:', error);
      })
  );
  // Forzar activación inmediata
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activado');
      // Tomar control inmediatamente
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones de chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Ignorar peticiones que no sean GET (PUT, POST, DELETE, etc.)
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar peticiones a la API para evitar cachear respuestas dinámicas
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('.php') || 
      url.search.includes('todos_precios') ||
      url.search.includes('precios_camping') ||
      url.search.includes('precio=') ||
      url.search.includes('disponibilidad') ||
      url.search.includes('reservas') ||
      url.search.includes('clientes') ||
      url.search.includes('tipos') ||
      url.search.includes('cantidades_personas') ||
      url.search.includes('reportes_ingresos') ||
      url.search.includes('cliente_id') ||
      url.search.includes('search=') ||
      url.search.includes('_t=')) {
    return;
  }

  // Estrategia para archivos de video: Network First
  if (request.destination === 'video' || 
      url.pathname.includes('.mp4') || 
      url.pathname.includes('.webm') || 
      url.pathname.includes('.ogg')) {
    console.log('🎥 Video detectado:', url.pathname);
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cachear si la respuesta es exitosa
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
                console.log('✅ Video cacheado:', url.pathname);
              })
              .catch((error) => {
                console.error('❌ Error al cachear video:', error);
              });
          }
          return response;
        })
        .catch((error) => {
          console.log('🌐 Video no disponible en red, intentando cache:', url.pathname);
          // Fallback: intentar obtener desde cache
          return caches.match(request);
        })
    );
    return;
  }

  // Estrategia para archivos CSS y JS: Stale While Revalidate
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      url.pathname.includes('.js') || 
      url.pathname.includes('.css')) {
    console.log('📄 CSS/JS detectado:', url.pathname);
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            // Actualizar cache con nueva respuesta
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
              console.log('✅ CSS/JS actualizado en cache:', url.pathname);
            }
            return networkResponse;
          }).catch((error) => {
            console.log('🌐 CSS/JS no disponible en red, usando cache:', url.pathname);
            // Si falla la red, devolver cache si existe
            return cachedResponse;
          });
          
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Estrategia para imágenes: Cache First
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request).then((fetchResponse) => {
            if (fetchResponse && fetchResponse.status === 200) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return fetchResponse;
          });
        })
    );
    return;
  }

  // Estrategia para HTML: Network First
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Estrategia por defecto: Cache First
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            if (request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Manejo de mensajes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 