import { useState, useEffect } from 'react';
import { CLIENTE_FIELDS, RESERVA_FIELDS } from '../../../constants/fields';
import { notify } from '../Notifications/NotificationSystem';
import config from '../../../config';

const useAdmin = () => {
    const [clientes, setClientes] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [activeTab, setActiveTab] = useState('calendario');
    const [error, setError] = useState(null);
    const [showClienteForm, setShowClienteForm] = useState(false);
    const [showReservaForm, setShowReservaForm] = useState(false);

    useEffect(() => {
        fetchClientes();
        fetchReservas();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await fetch(`${config.API_URL}/clientes.php`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('La respuesta no es un array:', data);
                setError('Error en el formato de los datos');
                return;
            }

            setClientes(data);
            setError(null);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            setError('Error al cargar los clientes');
            setClientes([]);
        }
    };

    const fetchReservas = async () => {
        try {
            const response = await fetch(`${config.API_URL}/reservas.php`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('La respuesta no es un array:', data);
                setError('Error en el formato de los datos');
                return;
            }

            setReservas(data);
            setError(null);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            setError('Error al cargar las reservas');
            setReservas([]);
        }
    };

    const handleCreateCliente = async (clienteData) => {
        try {
            const response = await fetch(`${config.API_URL}/clientes.php`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clienteData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al crear el cliente');
            }

            await fetchClientes();
            notify.success('Cliente creado exitosamente');
            return true;
        } catch (error) {
            console.error('Error al crear cliente:', error);
            notify.error(error.message || 'Error al crear el cliente');
            throw error;
        }
    };

    const handleDeleteCliente = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
            try {
                const response = await fetch(`${config.API_URL}/clientes.php?id=${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || `Error al eliminar el cliente`);
                }

                await fetchClientes();
                notify.success('Cliente eliminado exitosamente');
                return true;
            } catch (error) {
                console.error('Error al eliminar cliente:', error);
                notify.error(error.message || 'Error al eliminar el cliente');
                throw error;
            }
        }
        return false;
    };

    const handleDeleteReserva = async (id) => {
        try {
            const response = await fetch(`${config.API_URL}/reservas.php?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            await fetchReservas();
            return true;
        } catch (error) {
            console.error('Error al eliminar reserva:', error);
            throw error;
        }
    };

    return {
        clientes,
        reservas,
        activeTab,
        error,
        showClienteForm,
        showReservaForm,
        setActiveTab,
        setShowClienteForm,
        setShowReservaForm,
        handleCreateCliente,
        handleDeleteCliente,
        handleDeleteReserva,
        fetchClientes,
        fetchReservas
    };
};

export default useAdmin; 