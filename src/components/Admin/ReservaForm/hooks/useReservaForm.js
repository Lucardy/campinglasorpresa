import { useState, useEffect } from 'react';
import { notify } from '../../Notifications/NotificationSystem';
import config from '../../../../config';
import useHospedajes from '../../../../hooks/useHospedajes';

const useReservaForm = (clientesExternos = []) => {
    const [formData, setFormData] = useState({
        cliente_id: '',
        hospedaje_id: '',
        fecha_entrada: '',
        fecha_salida: '',
        cantidad_personas: '',
        monto_total: '',
        estado: 'activa',
        observaciones: '',
        metodo_pago: 'efectivo'
    });

    // Hook compartido para hospedajes
    const {
        tiposHospedaje,
        hospedajes,
        hospedajesDisponibles,
        loading: loadingHospedajes,
        fetchTiposHospedaje: fetchTiposHospedajeHook,
        fetchHospedajesDisponibles: fetchHospedajesDisponiblesHook,
        setHospedajes
    } = useHospedajes();

    const [tipoHospedajeSeleccionado, setTipoHospedajeSeleccionado] = useState('');
    const [tipoHospedajeNombre, setTipoHospedajeNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [clientes, setClientes] = useState(clientesExternos);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [fechasOcupadas, setFechasOcupadas] = useState([]);
    const [pasoActual, setPasoActual] = useState(1);
    const [disponibilidad, setDisponibilidad] = useState({ disponible: true, mensaje: '' });

    // Cargar tipos de hospedaje al montar el componente
    useEffect(() => {
        fetchTiposHospedajeHook();
    }, [fetchTiposHospedajeHook]);

    // Actualizar clientes cuando cambian los clientes externos
    useEffect(() => {
        setClientes(clientesExternos);
    }, [clientesExternos]);

    // Cargar fechas ocupadas cuando se seleccionan las fechas
    useEffect(() => {
        if (formData.fecha_entrada && formData.fecha_salida) {
            fetchFechasOcupadas();
        }
    }, [formData.fecha_entrada, formData.fecha_salida]);

    // Cargar hospedajes disponibles cuando cambian las fechas y el tipo
    useEffect(() => {
        if (formData.fecha_entrada && formData.fecha_salida && tipoHospedajeSeleccionado && tipoHospedajeSeleccionado !== '') {
            fetchHospedajesDisponiblesHook(
                tipoHospedajeSeleccionado,
                formData.fecha_entrada,
                formData.fecha_salida,
                { useDisponibilidadEndpoint: false }
            );
        }
    }, [formData.fecha_entrada, formData.fecha_salida, tipoHospedajeSeleccionado, fetchHospedajesDisponiblesHook]);

    // Verificar disponibilidad cuando cambia el hospedaje seleccionado
    useEffect(() => {
        if (formData.hospedaje_id && formData.fecha_entrada && formData.fecha_salida) {
            verificarDisponibilidad();
        }
    }, [formData.hospedaje_id, formData.fecha_entrada, formData.fecha_salida]);

    // Efecto para actualizar el precio cuando cambia el tipo de hospedaje o la cantidad de personas
    useEffect(() => {
        const actualizarPrecio = async () => {
            if (tipoHospedajeSeleccionado && formData.cantidad_personas && formData.fecha_entrada && formData.fecha_salida) {
                try {
                    const response = await fetch(`${config.API_URL}/hospedajes.php?precio&tipo_hospedaje_id=${tipoHospedajeSeleccionado}&cantidad_personas=${formData.cantidad_personas}`);
                    if (!response.ok) throw new Error('Error al obtener el precio');
                    const data = await response.json();
                    
                    if (data.success && data.precio) {
                        const fechaEntrada = new Date(formData.fecha_entrada);
                        const fechaSalida = new Date(formData.fecha_salida);
                        const diffTime = Math.abs(fechaSalida - fechaEntrada);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        const precioPorDia = data.precio;
                        const montoTotal = precioPorDia * diffDays;

                        setFormData(prev => ({
                            ...prev,
                            monto_total: montoTotal
                        }));
                    }
                } catch (error) {
                    console.error('Error al obtener el precio:', error);
                    notify.error('Error al obtener el precio');
                }
            }
        };

        actualizarPrecio();
    }, [tipoHospedajeSeleccionado, formData.cantidad_personas, formData.fecha_entrada, formData.fecha_salida, setFormData, notify, config.API_URL]);


    const fetchFechasOcupadas = async () => {
        try {
            const response = await fetch(
                `${config.API_URL}/reservas.php?fecha_entrada=${formData.fecha_entrada}&fecha_salida=${formData.fecha_salida}`
            );
            if (!response.ok) throw new Error('Error al cargar fechas ocupadas');
            const data = await response.json();
            setFechasOcupadas(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const verificarDisponibilidad = async () => {
        try {
            const response = await fetch(
                `${config.API_URL}/hospedajes.php?disponibilidad&hospedaje_id=${formData.hospedaje_id}&fecha_entrada=${formData.fecha_entrada}&fecha_salida=${formData.fecha_salida}`
            );
            if (!response.ok) throw new Error('Error al verificar disponibilidad');
            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Error al verificar disponibilidad');
            setDisponibilidad({ disponible: true, mensaje: '' });
        } catch (error) {
            console.error('Error:', error);
            setDisponibilidad({ disponible: false, mensaje: error.message || 'Error al verificar disponibilidad' });
            notify.error(error.message || 'Error al verificar disponibilidad');
        }
    };

    const handleFechaChange = (dates) => {
        const [start, end] = dates;
        setFormData(prev => ({
            ...prev,
            fecha_entrada: start ? start.toISOString().split('T')[0] : '',
            fecha_salida: end ? end.toISOString().split('T')[0] : ''
        }));
    };

    const handleTipoHospedajeChange = (e) => {
        const value = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        const nombre = selectedOption.text;
        
        console.log('Cambio de tipo de hospedaje:', { value, nombre });
        
        setTipoHospedajeSeleccionado(value);
        setTipoHospedajeNombre(nombre);
        setFormData(prev => ({
            ...prev,
            hospedaje_id: ''
        }));
        setError(null);
        setHospedajes([]);

        if (value && formData.fecha_entrada && formData.fecha_salida) {
            console.log('Iniciando búsqueda de hospedajes con:', {
                tipo_hospedaje_id: value,
                fecha_entrada: formData.fecha_entrada,
                fecha_salida: formData.fecha_salida
            });
            fetchHospedajesDisponiblesHook(
                value,
                formData.fecha_entrada,
                formData.fecha_salida,
                { useDisponibilidadEndpoint: false }
            );
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchChange = (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);
        
        if (searchValue.trim() === '') {
            setFilteredClientes([]);
            setShowResults(false);
            return;
        }

        const filtered = clientes.filter(cliente => {
            const searchLower = searchValue.toLowerCase();
            return (
                cliente.nombre.toLowerCase().includes(searchLower) ||
                cliente.apellido.toLowerCase().includes(searchLower) ||
                cliente.documento.toLowerCase().includes(searchLower)
            );
        });

        setFilteredClientes(filtered);
        setShowResults(true);
    };

    const handleClienteSelect = (cliente) => {
        setSelectedCliente(cliente);
        setFormData(prev => ({
            ...prev,
            cliente_id: cliente.id
        }));
        setSearchTerm(`${cliente.apellido}, ${cliente.nombre} - ${cliente.documento}`);
        setShowResults(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCliente) {
            setError('Por favor seleccione un cliente');
            notify.error('Por favor seleccione un cliente');
            return;
        }

        // Validación adicional del cliente seleccionado
        if (!selectedCliente.id || !formData.cliente_id) {
            setError('Cliente inválido. Por favor seleccione un cliente válido.');
            notify.error('Cliente inválido. Por favor seleccione un cliente válido.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const datosAEnviar = {
                ...formData,
                metodo_pago: formData.metodo_pago,
                descuento: formData.descuento !== undefined ? formData.descuento : 0
            };

            if (tipoHospedajeNombre.toLowerCase() === 'camping' || 
                tipoHospedajeNombre.toLowerCase() === 'grupos') {
                datosAEnviar.hospedaje_id = null;
            }

            // Para grupos, agregar observación especial
            if (tipoHospedajeNombre.toLowerCase() === 'grupos') {
                const observacionGrupo = datosAEnviar.observaciones ? 
                    `${datosAEnviar.observaciones} - RESERVA ESPECIAL PARA GRUPO` : 
                    'RESERVA ESPECIAL PARA GRUPO';
                datosAEnviar.observaciones = observacionGrupo;
            }

            console.log('Datos a enviar al backend:', datosAEnviar);
            console.log('Cliente seleccionado:', selectedCliente);
            console.log('Tipo de hospedaje:', tipoHospedajeNombre);
            console.log('Creando reserva con datos:', datosAEnviar);
            
            const data = await reservaService.createReserva(datosAEnviar);
            
            console.log('Respuesta del backend:', data);
            
            if (data.success && data.id) {
                notify.success(data.message || 'Reserva creada exitosamente');
                return { success: true, data };
            }
            
            if (data.error || !data.success) {
                const errorMessage = data.message || 'Error al crear la reserva';
                console.error('Error del servidor:', errorMessage);
                notify.error(errorMessage);
                throw new Error(errorMessage);
            }

            notify.success('Reserva creada exitosamente');
            return { success: true, data };
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            const errorMessage = error.message || 'Error al crear la reserva';
            setError(errorMessage);
            notify.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return {
        pasoActual,
        setPasoActual,
        formData,
        searchTerm,
        filteredClientes,
        showResults,
        tiposHospedaje,
        hospedajes,
        disponibilidad,
        error,
        loading,
        tipoHospedajeSeleccionado,
        tipoHospedajeNombre,
        selectedCliente,
        handleFechaChange,
        handleTipoHospedajeChange,
        handleChange,
        handleSearchChange,
        handleClienteSelect,
        handleSubmit
    };
};

export default useReservaForm;