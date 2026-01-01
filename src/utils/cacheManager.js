// Gestor de cache inteligente
class CacheManager {
    constructor() {
        this.CACHE_VERSION = '1.0.0'; // Incrementar esta versión cuando quieras forzar limpieza
        this.CACHE_KEY = 'app_cache_version';
    }

    // Verificar si necesita limpiar cache
    necesitaLimpieza() {
        try {
            const versionGuardada = localStorage.getItem(this.CACHE_KEY);
            return versionGuardada !== this.CACHE_VERSION;
        } catch (error) {
            console.log('⚠️ Error al verificar versión de cache:', error);
            return true; // Si hay error, limpiar por seguridad
        }
    }

    // Limpiar todo el cache
    limpiarCache() {
        try {
            console.log('🧹 Iniciando limpieza de cache...');
            
            // Limpiar localStorage y sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            
            // Limpiar cache de Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                        registration.unregister();
                    }
                });
            }
            
            // Limpiar cache del navegador
            if ('caches' in window) {
                caches.keys().then(function(names) {
                    for (let name of names) {
                        caches.delete(name);
                    }
                });
            }
            
            // Guardar nueva versión
            localStorage.setItem(this.CACHE_KEY, this.CACHE_VERSION);
            
            console.log('✅ Cache limpiado exitosamente');
            return true;
        } catch (error) {
            console.log('❌ Error al limpiar cache:', error);
            return false;
        }
    }

    // Limpiar cache solo si es necesario
    limpiarCacheSiNecesario() {
        if (this.necesitaLimpieza()) {
            console.log('🔄 Nueva versión detectada, limpiando cache...');
            return this.limpiarCache();
        } else {
            console.log('✅ Cache actualizado, no es necesario limpiar');
            return false;
        }
    }

    // Forzar limpieza de cache (para uso manual)
    forzarLimpieza() {
        console.log('🔄 Forzando limpieza de cache...');
        return this.limpiarCache();
    }

    // Obtener información del cache
    getInfo() {
        try {
            const versionGuardada = localStorage.getItem(this.CACHE_KEY);
            const tieneVersion = !!versionGuardada;
            const esActual = versionGuardada === this.CACHE_VERSION;
            
            return {
                versionActual: this.CACHE_VERSION,
                versionGuardada: versionGuardada,
                tieneVersion: tieneVersion,
                esActual: esActual,
                necesitaLimpieza: !esActual
            };
        } catch (error) {
            return {
                versionActual: this.CACHE_VERSION,
                versionGuardada: null,
                tieneVersion: false,
                esActual: false,
                necesitaLimpieza: true,
                error: error.message
            };
        }
    }
}

// Crear instancia global
const cacheManager = new CacheManager();

export default cacheManager;
