import { useState, useEffect } from 'react';
import { CLIENTE_FIELDS, RESERVA_FIELDS } from '../../../constants/fields';
import { notify } from '../Notifications/NotificationSystem';
import config from '../../../config';
import { useLocation } from 'react-router-dom';

const useAdmin = () => {
    const [clientes, setClientes] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [activeTab, setActiveTab] = useState('calendario');
    const [error, setError] = useState(null);
    const [showClienteForm, setShowClienteForm] = useState(false);
    const [showReservaForm, setShowReservaForm] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const location = useLocation();

    // Efecto para inicialización
    useEffect(() => {
        setIsInitializing(false);
    }, []);

    // Cargar datos iniciales solo una vez
    useEffect(() => {
        if (!dataLoaded && !isInitializing) {
            fetchClientes();
            fetchReservas();
            setDataLoaded(true);
        }
    }, [dataLoaded, isInitializing]);

    // Efecto para detectar cambios de ruta
    useEffect(() => {
        // Si estamos en el admin y no estamos inicializando, cargar datos
        if (location.pathname.includes('/admin') && !isInitializing) {
            fetchClientes();
            fetchReservas();
        }
    }, [location.pathname, isInitializing]);

    // Efecto para forzar recarga cuando se detecte autenticación persistente
    useEffect(() => {
        console.log('🔄 useEffect de autenticación persistente ejecutado');
        console.log('🔄 localStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));
        console.log('🔄 location.pathname:', location.pathname);
        
        // Si estamos en el admin y hay autenticación persistente, forzar recarga
        if (location.pathname.includes('/admin') && 
            localStorage.getItem('isAuthenticated') === 'true' && 
            !isInitializing) {
            console.log('🔄 Detectada autenticación persistente, forzando recarga de datos...');
            setDataLoaded(false);
            fetchClientes();
            fetchReservas();
            setDataLoaded(true);
        }
    }, [location.pathname, isInitializing]);

    const fetchClientes = async () => {
        try {
            console.log('🔄 Iniciando fetchClientes...');
            const timestamp = new Date().getTime();
            const response = await fetch(`${config.API_URL}/clientes.php?_t=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Datos recibidos:', data);
            console.log('📊 Cantidad de clientes:', Array.isArray(data) ? data.length : 'No es array');
            
            if (!Array.isArray(data)) {
                console.error('❌ La respuesta no es un array:', data);
                setError('Error en el formato de los datos');
                return;
            }

            setClientes(data);
            setError(null);
            console.log('✅ Clientes actualizados exitosamente');
        } catch (error) {
            console.error('❌ Error al cargar clientes:', error);
            setError('Error al cargar los clientes');
            setClientes([]);
        }
    };

    const fetchReservas = async () => {
        try {
            console.log('🔄 Iniciando fetchReservas...');
            console.log('🌐 API URL:', config.API_URL);
            const timestamp = new Date().getTime();
            const url = `${config.API_URL}/reservas.php?_t=${timestamp}`;
            console.log('📡 URL completa:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            // Verificar el Content-Type antes de parsear JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('❌ La respuesta no es JSON. Content-Type:', contentType);
                console.error('❌ Respuesta recibida:', textResponse.substring(0, 500));
                throw new Error(`El servidor devolvió un error. Verifica la URL de la API: ${config.API_URL}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error HTTP:', response.status, errorText);
                throw new Error(`Error HTTP ${response.status}: ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();
            console.log('📊 Datos recibidos:', data);
            console.log('📊 Cantidad de reservas:', Array.isArray(data) ? data.length : 'No es array');
            
            if (!Array.isArray(data)) {
                console.error('❌ La respuesta no es un array:', data);
                setError('Error en el formato de los datos');
                return;
            }

            setReservas(data);
            setError(null);
            console.log('✅ Reservas actualizadas exitosamente');
        } catch (error) {
            console.error('❌ Error al cargar reservas:', error);
            console.error('❌ URL que falló:', url);
            setError(`Error al cargar las reservas: ${error.message}`);
            setReservas([]);
        }
    };

    const handleCreateCliente = async (clienteData) => {
        try {
            console.log('🔄 Iniciando handleCreateCliente...');
            console.log('📝 Datos del cliente:', clienteData);
            console.log('🔗 URL de la API:', `${config.API_URL}/clientes.php`);
            
            const response = await fetch(`${config.API_URL}/clientes.php`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clienteData)
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            if (!response.ok) {
                const data = await response.json();
                console.error('❌ Error en la respuesta:', data);
                throw new Error(data.message || 'Error al crear el cliente');
            }

            const responseData = await response.json();
            console.log('✅ Cliente creado exitosamente:', responseData);
            
            console.log('🔄 Llamando fetchClientes para actualizar la lista...');
            await fetchClientes();
            console.log('✅ fetchClientes completado');
            
            notify.success('Cliente creado exitosamente');
            console.log('✅ Notificación enviada');
            
            // Retornar el objeto del cliente creado para obtener el ID
            return responseData.cliente || responseData;
        } catch (error) {
            console.error('❌ Error al crear cliente:', error);
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

    const handleCreateReserva = async (reservaData) => {
        try {
            console.log('🔄 Iniciando handleCreateReserva...');
            console.log('📝 Datos de la reserva:', reservaData);
            
            const response = await fetch(`${config.API_URL}/reservas.php`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservaData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al crear la reserva');
            }

            const responseData = await response.json();
            console.log('✅ Reserva creada exitosamente:', responseData);
            
            if (responseData.success && responseData.id) {
                // Actualizar la lista de reservas y clientes (para actualizar total_reservas)
                await fetchReservas();
                await fetchClientes();
                
                notify.success(responseData.message || 'Reserva creada exitosamente');
                return responseData;
            } else {
                throw new Error(responseData.message || 'Error al crear la reserva');
            }
        } catch (error) {
            console.error('❌ Error al crear reserva:', error);
            notify.error(error.message || 'Error al crear la reserva');
            throw error;
        }
    };

    const handleUpdateReserva = async (id, reservaData) => {
        try {
            console.log('🔄 Iniciando handleUpdateReserva...');
            console.log('📝 Datos de la reserva:', reservaData);
            
            const response = await fetch(`${config.API_URL}/reservas.php`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    ...reservaData
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al actualizar la reserva');
            }

            console.log('✅ Reserva actualizada exitosamente');
            
            // Actualizar la lista de reservas
            await fetchReservas();
            
            notify.success('Reserva actualizada exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error al actualizar reserva:', error);
            notify.error(error.message || 'Error al actualizar la reserva');
            throw error;
        }
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

    const forceReload = () => {
        console.log('🔄 Forzando recarga de datos...');
        setDataLoaded(false);
        fetchClientes();
        fetchReservas();
        setDataLoaded(true);
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
        handleCreateReserva,
        handleUpdateReserva,
        handleDeleteReserva,
        fetchClientes,
        fetchReservas,
        forceReload
    };
};

export default useAdmin; 