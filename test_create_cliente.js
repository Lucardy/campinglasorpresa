// Script de prueba para verificar la creación de clientes
const API_URL = 'https://www.campinglasorpresa.com/api/endpoints';

async function testCreateCliente() {
    console.log('🧪 Iniciando prueba de creación de cliente...');
    
    try {
        // Test 1: Obtener clientes antes de crear
        console.log('\n📡 Test 1: Obteniendo clientes antes de crear...');
        const response1 = await fetch(`${API_URL}/clientes.php`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        const clientesAntes = await response1.json();
        console.log('✅ Clientes antes de crear:', clientesAntes.length);
        
        // Test 2: Crear un cliente de prueba
        console.log('\n📡 Test 2: Creando cliente de prueba...');
        const clienteTest = {
            nombre: 'Test',
            apellido: 'Usuario',
            documento: '12345678',
            telefono: '1234567890',
            modelo_vehiculo: 'Test',
            patente: 'TEST123'
        };
        
        const response2 = await fetch(`${API_URL}/clientes.php`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteTest)
        });
        
        console.log('Status:', response2.status);
        const resultado = await response2.json();
        console.log('✅ Resultado creación:', resultado);
        
        // Test 3: Verificar que el cliente se creó
        console.log('\n📡 Test 3: Verificando cliente creado...');
        const response3 = await fetch(`${API_URL}/clientes.php`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        const clientesDespues = await response3.json();
        console.log('✅ Clientes después de crear:', clientesDespues.length);
        
        const clienteCreado = clientesDespues.find(c => 
            c.documento === '12345678' && c.nombre === 'Test'
        );
        
        if (clienteCreado) {
            console.log('✅ Cliente de prueba encontrado:', clienteCreado);
        } else {
            console.log('❌ Cliente de prueba NO encontrado');
        }
        
        console.log('📊 Diferencia:', clientesDespues.length - clientesAntes.length);
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar las pruebas
testCreateCliente(); 