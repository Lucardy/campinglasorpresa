// Script para simular autenticación y verificar el problema
console.log('🧪 Iniciando prueba de autenticación...');

// Función para simular login
function simulateLogin() {
    console.log('🧪 Simulando login...');
    localStorage.setItem('isAuthenticated', 'true');
    console.log('🧪 localStorage actualizado:', localStorage.getItem('isAuthenticated'));
    
    // Recargar la página para que tome el nuevo estado
    console.log('🧪 Recargando página...');
    window.location.reload();
}

// Función para simular logout
function simulateLogout() {
    console.log('🧪 Simulando logout...');
    localStorage.removeItem('isAuthenticated');
    console.log('🧪 localStorage limpiado');
}

// Función para verificar estado actual
function checkAuthStatus() {
    console.log('🧪 Verificando estado de autenticación...');
    console.log('🧪 localStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));
    console.log('🧪 URL actual:', window.location.href);
    console.log('🧪 Pathname:', window.location.pathname);
}

// Ejecutar verificación inicial
checkAuthStatus();

// Si no está autenticado y está en el admin, simular login
if (window.location.pathname.includes('/admin') && localStorage.getItem('isAuthenticated') !== 'true') {
    console.log('🧪 Detectado acceso al admin sin autenticación, simulando login...');
    simulateLogin();
}

console.log('🧪 Script de autenticación cargado');
console.log('🧪 Para simular login manualmente, ejecuta: simulateLogin()');
console.log('🧪 Para simular logout manualmente, ejecuta: simulateLogout()');
console.log('🧪 Para verificar estado, ejecuta: checkAuthStatus()'); 