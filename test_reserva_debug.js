// Script de prueba para debuggear el problema con las reservas
const API_URL = 'https://campinglasorpresa.com/api/endpoints';

async function testReservaDebug() {
    console.log('🧪 Iniciando prueba de debug de reserva...');
    
    try {
        // Test 1: Verificar que el endpoint responde
        console.log('\n📡 Test 1: Verificando endpoint...');
        const testResponse = await fetch(`${API_URL}/reservas.php`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status GET:', testResponse.status);
        console.log('📊 Headers GET:', Object.fromEntries(testResponse.headers.entries()));
        
        // Test 2: Crear una reserva de prueba con datos mínimos
        console.log('\n📡 Test 2: Creando reserva de prueba...');
        const reservaTest = {
            cliente_id: 1,
            hospedaje_id: null,
            fecha_entrada: '2025-08-25',
            fecha_salida: '2025-08-30',
            cantidad_personas: 2,
            monto_total: 5000,
            estado: 'activa',
            observaciones: 'Reserva de prueba desde script debug',
            metodo_pago: 'efectivo',
            descuento: 0
        };
        
        console.log('📤 Datos a enviar:', reservaTest);
        console.log('📤 JSON stringificado:', JSON.stringify(reservaTest));
        
        const response = await fetch(`${API_URL}/reservas.php`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaTest)
        });
        
        console.log('📊 Status POST:', response.status);
        console.log('📊 Status Text:', response.statusText);
        console.log('📊 Headers POST:', Object.fromEntries(response.headers.entries()));
        
        // Intentar leer la respuesta
        let resultado;
        try {
            const responseText = await response.text();
            console.log('📄 Response text:', responseText);
            
            if (responseText.trim()) {
                resultado = JSON.parse(responseText);
                console.log('✅ JSON parseado exitosamente:', resultado);
            } else {
                console.log('⚠️ Response text está vacío');
                resultado = null;
            }
        } catch (parseError) {
            console.log('❌ Error al parsear JSON:', parseError);
            resultado = null;
        }
        
        if (resultado && resultado.success && resultado.id) {
            console.log('✅ Reserva creada exitosamente con ID:', resultado.id);
        } else if (resultado && resultado.error) {
            console.log('❌ Error en la creación:', resultado);
        } else {
            console.log('⚠️ Respuesta inesperada:', resultado);
        }
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        console.error('❌ Error stack:', error.stack);
    }
}

// Ejecutar las pruebas
testReservaDebug();
