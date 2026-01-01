// Script de prueba para verificar el routing y la carga de datos
console.log('🧪 Iniciando prueba de routing...');

// Función para simular la navegación
function testNavigation() {
    console.log('🧪 Simulando navegación al admin...');
    
    // Verificar si estamos en la página correcta
    console.log('📍 URL actual:', window.location.href);
    console.log('📍 Pathname:', window.location.pathname);
    
    // Verificar si el componente Admin está presente
    const adminElement = document.querySelector('[data-testid="admin"]') || 
                        document.querySelector('.admin-layout') ||
                        document.querySelector('[class*="admin"]');
    
    console.log('🔍 Elemento Admin encontrado:', !!adminElement);
    
    // Verificar si hay elementos de clientes
    const clientesElement = document.querySelector('[class*="clientes"]') ||
                           document.querySelector('[class*="cliente"]');
    
    console.log('🔍 Elementos de clientes encontrados:', !!clientesElement);
    
    // Verificar si hay logs de nuestro código
    console.log('🔍 Buscando logs de nuestro código...');
    
    // Simular un clic en el botón de actualizar si existe
    const refreshButton = document.querySelector('.btn-refresh') ||
                         document.querySelector('[onclick*="refresh"]') ||
                         document.querySelector('button:contains("Actualizar")');
    
    if (refreshButton) {
        console.log('🔍 Botón de actualizar encontrado, simulando clic...');
        refreshButton.click();
    } else {
        console.log('❌ Botón de actualizar NO encontrado');
    }
}

// Ejecutar la prueba después de un pequeño delay
setTimeout(testNavigation, 2000);

// También ejecutar cuando se complete la carga de la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testNavigation);
} else {
    testNavigation();
}

console.log('🧪 Script de prueba cargado'); 