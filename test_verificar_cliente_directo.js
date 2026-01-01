// Script para verificar directamente la consulta de cliente
const API_URL = 'https://campinglasorpresa.com/api/endpoints';

async function testVerificarClienteDirecto() {
    console.log('🔍 Verificando cliente directamente...');
    
    try {
        // Test 1: Verificar cliente existente
        console.log('\n📡 Test 1: Verificando cliente existente (ID 13)...');
        const responseExistente = await fetch(`${API_URL}/clientes.php?id=13`);
        console.log('📊 Status existente:', responseExistente.status);
        
        if (responseExistente.ok) {
            const cliente = await responseExistente.json();
            console.log('✅ Cliente existente encontrado:', cliente);
        } else {
            console.log('❌ Error al obtener cliente existente');
        }
        
        // Test 2: Verificar cliente inexistente
        console.log('\n📡 Test 2: Verificando cliente inexistente (ID 99999)...');
        const responseInexistente = await fetch(`${API_URL}/clientes.php?id=99999`);
        console.log('📊 Status inexistente:', responseInexistente.status);
        
        if (responseInexistente.ok) {
            const cliente = await responseInexistente.json();
            console.log('📄 Cliente inexistente:', cliente);
        } else {
            console.log('❌ Error al obtener cliente inexistente');
        }
        
        // Test 3: Crear reserva con cliente inexistente y ver qué pasa
        console.log('\n📡 Test 3: Creando reserva con cliente inexistente...');
        const reservaInvalida = {
            cliente_id: 99999,
            hospedaje_id: null,
            fecha_entrada: '2025-08-26',
            fecha_salida: '2025-08-31',
            cantidad_personas: 2,
            monto_total: 5000,
            estado: 'activa',
            observaciones: 'Test cliente inexistente',
            metodo_pago: 'efectivo',
            descuento: 0
        };
        
        const responseReserva = await fetch(`${API_URL}/reservas.php`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaInvalida)
        });
        
        console.log('📊 Status reserva:', responseReserva.status);
        const resultadoReserva = await responseReserva.json();
        console.log('📄 Resultado reserva:', resultadoReserva);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar la verificación
testVerificarClienteDirecto();
