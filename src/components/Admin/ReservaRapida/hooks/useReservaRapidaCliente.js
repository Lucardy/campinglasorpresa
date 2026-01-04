import { useState } from 'react';
import { toast } from 'react-toastify';

/**
 * Hook para manejar la lógica de búsqueda y creación de clientes
 */
export const useReservaRapidaCliente = (clientes, handleCreateCliente, formData, setFormData) => {
    const [clienteExistente, setClienteExistente] = useState(null);

    /**
     * Busca un cliente existente por documento
     */
    const buscarClienteExistente = (documento) => {
        if (documento.length >= 7) {
            const cliente = clientes.find(c => 
                c.documento.toLowerCase().includes(documento.toLowerCase())
            );
            if (cliente) {
                setClienteExistente(cliente);
                setFormData(prev => ({
                    ...prev,
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    telefono: cliente.telefono,
                    modelo_vehiculo: cliente.modelo_vehiculo,
                    patente: cliente.patente
                }));
                toast.info(`Cliente encontrado: ${cliente.nombre} ${cliente.apellido}`);
            } else {
                setClienteExistente(null);
            }
        }
    };

    /**
     * Crea un nuevo cliente o retorna el existente
     */
    const obtenerOcrearCliente = async () => {
        if (clienteExistente) {
            return clienteExistente.id;
        }

        const clienteData = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            documento: formData.documento,
            telefono: formData.telefono,
            modelo_vehiculo: formData.modelo_vehiculo || null,
            patente: formData.patente || null
        };

        console.log('🔄 Creando nuevo cliente con datos:', clienteData);
        const nuevoCliente = await handleCreateCliente(clienteData);
        console.log('✅ Cliente creado, respuesta:', nuevoCliente);
        
        // Verificar que el cliente tenga un ID
        if (!nuevoCliente || !nuevoCliente.id) {
            throw new Error('Error: No se pudo obtener el ID del cliente creado');
        }
        
        console.log('✅ Cliente ID obtenido:', nuevoCliente.id);
        return nuevoCliente.id;
    };

    return {
        clienteExistente,
        setClienteExistente,
        buscarClienteExistente,
        obtenerOcrearCliente
    };
};

