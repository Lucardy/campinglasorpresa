// Script para verificar qué clientes existen en la base de datos
const API_URL = 'https://campinglasorpresa.com/api/endpoints';

async function verificarClientes() {
    console.log('🔍 Verificando clientes existentes...');
    
    try {
        const response = await fetch(`${API_URL}/clientes.php`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const clientes = await response.json();
        console.log('📋 Clientes encontrados:', clientes.length);
        
        if (Array.isArray(clientes) && clientes.length > 0) {
            console.log('👥 Primeros 5 clientes:');
            clientes.slice(0, 5).forEach((cliente, index) => {
                console.log(`  ${index + 1}. ID: ${cliente.id}, Nombre: ${cliente.nombre} ${cliente.apellido}, DNI: ${cliente.documento}`);
            });
            
            // Usar el primer cliente para la prueba
            const primerCliente = clientes[0];
            console.log(`\n🧪 Usando cliente ID ${primerCliente.id} para la prueba...`);
            
            // Crear una reserva con el cliente existente
            const reservaTest = {
                cliente_id: primerCliente.id,
                hospedaje_id: null,
                fecha_entrada: '2025-08-25',
                fecha_salida: '2025-08-30',
                cantidad_personas: 2,
                monto_total: 5000,
                estado: 'activa',
                observaciones: 'Reserva de prueba con cliente existente',
                metodo_pago: 'efectivo',
                descuento: 0
            };
            
            console.log('📤 Creando reserva con cliente existente...');
            const reservaResponse = await fetch(`${API_URL}/reservas.php`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservaTest)
            });
            
            console.log('📊 Status reserva:', reservaResponse.status);
            
            const resultado = await reservaResponse.json();
            console.log('📄 Resultado:', resultado);
            
            if (resultado.success && resultado.id) {
                console.log('✅ Reserva creada exitosamente con ID:', resultado.id);
            } else {
                console.log('❌ Error al crear reserva:', resultado);
            }
            
        } else {
            console.log('⚠️ No se encontraron clientes en la base de datos');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar la verificación
verificarClientes();
