// Script para forzar la actualización del Service Worker
console.log('🔄 Forzando actualización del Service Worker...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ Service Worker desregistrado:', registration.scope);
    }
  }).then(function() {
    // Limpiar todos los caches
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('🗑️ Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(function() {
        console.log('✅ Todos los caches eliminados');
        // Recargar la página para registrar el nuevo Service Worker
        window.location.reload(true);
      });
    }
  });
} else {
  console.log('❌ Service Worker no soportado');
}
