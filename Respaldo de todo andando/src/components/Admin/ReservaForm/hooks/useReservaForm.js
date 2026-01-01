import { useState, useEffect } from 'react';
import { notify } from '../../Notifications/NotificationSystem';
import config from '../../../../config';

const useReservaForm = () => {
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

    const [hospedajes, setHospedajes] = useState([]);
    const [tiposHospedaje, setTiposHospedaje] = useState([]);
    const [tipoHospedajeSeleccionado, setTipoHospedajeSeleccionado] = useState('');
    const [tipoHospedajeNombre, setTipoHospedajeNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [fechasOcupadas, setFechasOcupadas] = useState([]);
    const [pasoActual, setPasoActual] = useState(1);
    const [disponibilidad, setDisponibilidad] = useState({ disponible: true, mensaje: '' });

    // Cargar tipos de hospedaje y clientes al montar el componente
    useEffect(() => {
        fetchTiposHospedaje();
        fetchClientes();
    }, []);

    // Cargar fechas ocupadas cuando se seleccionan las fechas
    useEffect(() => {
        if (formData.fecha_entrada && formData.fecha_salida) {
            fetchFechasOcupadas();
        }
    }, [formData.fecha_entrada, formData.fecha_salida]);

    // Cargar hospedajes disponibles cuando cambian las fechas y el tipo
    useEffect(() => {
        if (formData.fecha_entrada && formData.fecha_salida && tipoHospedajeSeleccionado && tipoHospedajeSeleccionado !== '') {
            fetchHospedajesDisponibles();
        }
    }, [formData.fecha_entrada, formData.fecha_salida, tipoHospedajeSeleccionado]);

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
                        // Calcular la cantidad de días
                        const fechaEntrada = new Date(formData.fecha_entrada);
                        const fechaSalida = new Date(formData.fecha_salida);
                        const diffTime = Math.abs(fechaSalida - fechaEntrada);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        // El precio ya incluye el costo por día para la cantidad de personas seleccionada
                        const precioPorDia = data.precio;
                        const montoTotal = precioPorDia * diffDays;

                        setFormData(prev => ({
                            ...prev,
                            monto_total: montoTotal
                        }));
                    }
                } catch (error) {
                    console.error('Error al obtener el precio:', error);
                    notify('Error al obtener el precio', 'error');
                }
            }
        };

        actualizarPrecio();
    }, [tipoHospedajeSeleccionado, formData.cantidad_personas, formData.fecha_entrada, formData.fecha_salida]);

    const fetchTiposHospedaje = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await fetch(`${config.API_URL}/hospedajes.php?tipos`);
            if (!response.ok) throw new Error('Error al cargar tipos de hospedaje');
            const data = await response.json();
            if (data.success && Array.isArray(data.tipos)) {
                setTiposHospedaje(data.tipos);
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar tipos de hospedaje');
            notify.error('Error al cargar tipos de hospedaje');
        } finally {
            setLoading(false);
        }
    };

    const fetchClientes = async () => {
        try {
            const response = await fetch(`${config.API_URL}/clientes.php`);
            if (!response.ok) throw new Error('Error al cargar clientes');
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error('Error:', error);
            notify.error('Error al cargar clientes');
        }
    };

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

    const fetchHospedajesDisponibles = async (tipoHospedajeId = null) => {
        try {
            setError(null);
            setLoading(true);
            
            const tipoId = tipoHospedajeId || tipoHospedajeSeleccionado;
            
            if (!tipoId) {
                console.log('Falta el tipo de hospedaje');
                return;
            }

            if (!formData.fecha_entrada || !formData.fecha_salida) {
                console.log('Faltan las fechas');
                return;
            }

            const url = `${config.API_URL}/hospedajes.php?tipo_hospedaje_id=${tipoId}&fecha_entrada=${formData.fecha_entrada}&fecha_salida=${formData.fecha_salida}`;
            console.log('URL de búsqueda:', url);

            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('Error en la respuesta:', data);
                throw new Error(data.message || 'Error al cargar hospedajes');
            }
            
            console.log('Respuesta del servidor:', data);

            if (!data.success) {
                throw new Error(data.message || 'Error al cargar hospedajes');
            }

            setHospedajes(data.hospedajes || []);
            setError(null);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al cargar hospedajes disponibles');
            notify.error(error.message || 'Error al cargar hospedajes disponibles');
            setHospedajes([]);
        } finally {
            setLoading(false);
        }
    };

    const verificarDisponibilidad = async () => {
        if (!formData.hospedaje_id || !formData.fecha_entrada || !formData.fecha_salida) return;

        try {
            const response = await fetch(
                `${config.API_URL}/hospedajes.php?disponibilidad&id=${formData.hospedaje_id}&fecha_entrada=${formData.fecha_entrada}&fecha_salida=${formData.fecha_salida}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.message || 'Error al verificar disponibilidad');
            }

            setDisponibilidad({
                disponible: data.disponible,
                mensaje: data.disponible ? 'Hospedaje disponible' : 'El hospedaje ya está reservado para las fechas seleccionadas'
            });
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            setDisponibilidad({
                disponible: false,
                mensaje: 'Error al verificar disponibilidad'
            });
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
        
        // Actualizar estados
        setTipoHospedajeSeleccionado(value);
        setTipoHospedajeNombre(nombre);
        setFormData(prev => ({
            ...prev,
            hospedaje_id: '' // Resetear el hospedaje seleccionado
        }));
        setError(null); // Limpiar errores anteriores
        setHospedajes([]); // Limpiar la lista de hospedajes

        // Si ya tenemos fechas seleccionadas, cargar los hospedajes inmediatamente
        if (value && formData.fecha_entrada && formData.fecha_salida) {
            console.log('Iniciando búsqueda de hospedajes con:', {
                tipo_hospedaje_id: value,
                fecha_entrada: formData.fecha_entrada,
                fecha_salida: formData.fecha_salida
            });
            fetchHospedajesDisponibles(value);
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

        setLoading(true);
        setError(null);

        try {
            // Preparar los datos a enviar
            const datosAEnviar = {
                ...formData,
                metodo_pago: formData.metodo_pago
            };

            // Si es camping, asegurarnos de que hospedaje_id sea null
            if (tipoHospedajeNombre.toLowerCase() === 'camping') {
                datosAEnviar.hospedaje_id = null;
            }

            const response = await fetch(`${config.API_URL}/reservas.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosAEnviar)
            });

            const data = await response.json();
            
            // Si la respuesta tiene un ID, significa que la reserva se creó exitosamente
            if (data.id) {
                notify.success('Reserva creada exitosamente');
                return { success: true, data };
            }
            
            // Si hay un error en la respuesta
            if (data.error) {
                notify.error(data.message || 'Error al crear la reserva');
                throw new Error(data.message || 'Error al crear la reserva');
            }

            // Si no hay ID ni error, asumimos que fue exitoso
            notify.success('Reserva creada exitosamente');
            return { success: true, data };
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
            notify.error(error.message);
            return { success: false, error: error.message };
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