// Script de prueba para verificar las mejoras en el manejo de errores
const API_URL = 'https://campinglasorpresa.com/api/endpoints';

async function testReservaMejorado() {
    console.log('🧪 Iniciando prueba de reserva mejorada...');
    
    try {
        // Test 1: Obtener clientes existentes
        console.log('\n📡 Test 1: Obteniendo clientes...');
        const clientesResponse = await fetch(`${API_URL}/clientes.php`);
        const clientes = await clientesResponse.json();
        
        if (!Array.isArray(clientes) || clientes.length === 0) {
            console.log('❌ No se encontraron clientes');
            return;
        }
        
        const primerCliente = clientes[0];
        console.log(`✅ Cliente encontrado: ID ${primerCliente.id}, ${primerCliente.nombre} ${primerCliente.apellido}`);
        
        // Test 2: Crear reserva con cliente válido
        console.log('\n📡 Test 2: Creando reserva con cliente válido...');
        const reservaValida = {
            cliente_id: primerCliente.id,
            hospedaje_id: null,
            fecha_entrada: '2025-08-26',
            fecha_salida: '2025-08-31',
            cantidad_personas: 2,
            monto_total: 5000,
            estado: 'activa',
            observaciones: 'Reserva de prueba mejorada',
            metodo_pago: 'efectivo',
            descuento: 0
        };
        
        const responseValida = await fetch(`${API_URL}/reservas.php`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaValida)
        });
        
        console.log('📊 Status válida:', responseValida.status);
        const resultadoValida = await responseValida.json();
        console.log('📄 Resultado válida:', resultadoValida);
        
        if (resultadoValida.success && resultadoValida.id) {
            console.log('✅ Reserva válida creada exitosamente');
        } else {
            console.log('❌ Error en reserva válida:', resultadoValida);
        }
        
        // Test 3: Intentar crear reserva con cliente inexistente
        console.log('\n📡 Test 3: Intentando crear reserva con cliente inexistente...');
        const reservaInvalida = {
            cliente_id: 99999, // Cliente que no existe
            hospedaje_id: null,
            fecha_entrada: '2025-08-26',
            fecha_salida: '2025-08-31',
            cantidad_personas: 2,
            monto_total: 5000,
            estado: 'activa',
            observaciones: 'Reserva con cliente inexistente',
            metodo_pago: 'efectivo',
            descuento: 0
        };
        
        const responseInvalida = await fetch(`${API_URL}/reservas.php`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaInvalida)
        });
        
        console.log('📊 Status inválida:', responseInvalida.status);
        const resultadoInvalida = await responseInvalida.json();
        console.log('📄 Resultado inválida:', resultadoInvalida);
        
        if (resultadoInvalida.error && resultadoInvalida.message) {
            console.log('✅ Error manejado correctamente:', resultadoInvalida.message);
        } else {
            console.log('⚠️ Respuesta inesperada para cliente inexistente');
        }
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar las pruebas
testReservaMejorado();
