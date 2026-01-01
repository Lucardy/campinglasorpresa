// Script de prueba para verificar la creación de reservas
const API_URL = 'https://campinglasorpresa.com/api/endpoints';

async function testCreateReserva() {
    console.log('🧪 Iniciando prueba de creación de reserva...');
    
    try {
        // Test 1: Crear una reserva de prueba
        console.log('\n📡 Test 1: Creando reserva de prueba...');
        const reservaTest = {
            cliente_id: 1,
            hospedaje_id: null,
            fecha_entrada: '2025-08-25',
            fecha_salida: '2025-08-30',
            cantidad_personas: 2,
            monto_total: 5000,
            estado: 'activa',
            observaciones: 'Reserva de prueba desde script',
            metodo_pago: 'efectivo',
            descuento: 0
        };
        
        console.log('📤 Datos a enviar:', reservaTest);
        
        const response = await fetch(`${API_URL}/reservas.php`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaTest)
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Status Text:', response.statusText);
        console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
        
        const resultado = await response.json();
        console.log('✅ Resultado creación:', resultado);
        
        if (resultado.success && resultado.id) {
            console.log('✅ Reserva creada exitosamente con ID:', resultado.id);
        } else {
            console.log('❌ Error en la creación:', resultado);
        }
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar las pruebas
testCreateReserva(); 