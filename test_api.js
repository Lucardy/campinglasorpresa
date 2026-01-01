// Script de prueba para verificar la conectividad con la API corregida
const API_URL = 'https://www.campinglasorpresa.com/api/endpoints';

async function testAPI() {
    console.log('🧪 Iniciando pruebas de conectividad...');
    console.log('🔗 URL de prueba:', API_URL);
    
    try {
        // Test 1: Obtener clientes
        console.log('\n📡 Test 1: Obteniendo clientes...');
        const response1 = await fetch(`${API_URL}/clientes.php`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response1.status);
        console.log('Headers:', response1.headers);
        
        if (!response1.ok) {
            throw new Error(`HTTP error! status: ${response1.status}`);
        }
        
        const clientes = await response1.json();
        console.log('✅ Clientes obtenidos:', clientes.length);
        console.log('Primer cliente:', clientes[0]);
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar las pruebas
testAPI(); 