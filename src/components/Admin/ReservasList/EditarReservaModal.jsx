import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendar, FaUsers, FaMoneyBillWave, FaCreditCard, FaComment, FaPercent, FaSave, FaUndo, FaUser, FaChild, FaHome } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { notify } from '../Notifications/NotificationSystem';
import config from '../../../config';
import { formatDate, parseLocalDate, formatDateForInput } from '../../../utils/dateUtils';
import GestionPagos from './GestionPagos';
import './EditarReservaModal.css';
import es from 'date-fns/locale/es';

const EditarReservaModal = ({ reserva, isOpen, onClose, onReservaUpdated, onRefresh, onPagoActualizado }) => {
    // Crear fecha mínima permitida: hasta 2 días anteriores (3 si es antes de las 6:00am)
    const getTodayStart = () => {
        const now = new Date();
        const horaActual = now.getHours();
        const fechaMinima = new Date();
        fechaMinima.setHours(0, 0, 0, 0);
        
        // Permitir hasta 2 días anteriores como mínimo
        fechaMinima.setDate(fechaMinima.getDate() - 2);
        
        // Si es antes de las 6:00am, permitir un día adicional (hasta 3 días anteriores)
        if (horaActual < 6) {
            fechaMinima.setDate(fechaMinima.getDate() - 1);
        }
        
        return fechaMinima;
    };

    const [formData, setFormData] = useState({
        fecha_entrada: '',
        fecha_salida: '',
        cantidad_personas: '',
        monto_total: '',
        metodo_pago: 'efectivo',
        descuento: 0,
        observaciones: '',
        estado: 'activa'
    });
    
    // Campos específicos para camping
    const [cantidadAdultos, setCantidadAdultos] = useState('');
    const [cantidadMenores, setCantidadMenores] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tiposHospedaje, setTiposHospedaje] = useState([]);
    const [hospedajes, setHospedajes] = useState([]);
    const [tipoHospedajeSeleccionado, setTipoHospedajeSeleccionado] = useState('');
    const [tipoHospedajeNombre, setTipoHospedajeNombre] = useState('');
    const [hospedajeSeleccionado, setHospedajeSeleccionado] = useState('');
    const [loadingHospedajes, setLoadingHospedajes] = useState(false);
    const [refreshReserva, setRefreshReserva] = useState(0);
    
    // Estado para el desglose de precio
    const [desglosePrecio, setDesglosePrecio] = useState({
        precioBase: 0,
        precioAdultos: 0,
        precioMenores: 0,
        precioPorDia: 0,
        cantidadDias: 0,
        subtotal: 0,
        descuento: 0,
        total: 0
    });

    useEffect(() => {
        if (isOpen && reserva) {
            // Cargar datos de la reserva
            setFormData({
                fecha_entrada: reserva.fecha_entrada,
                fecha_salida: reserva.fecha_salida,
                cantidad_personas: reserva.cantidad_personas,
                monto_total: reserva.monto_total,
                metodo_pago: reserva.metodo_pago || 'efectivo',
                descuento: reserva.descuento || 0,
                observaciones: reserva.observaciones || '',
                estado: reserva.estado || 'activa'
            });

            // Inicializar hospedaje actual
            if (reserva.hospedaje_id) {
                setHospedajeSeleccionado(reserva.hospedaje_id);
            } else {
                setHospedajeSeleccionado('');
            }
            
            // Cargar tipos de hospedaje primero, luego cargar el tipo del hospedaje si existe
            fetchTiposHospedaje().then(() => {
                if (reserva.hospedaje_id) {
                    fetchTipoHospedajeDelHospedaje(reserva.hospedaje_id);
                }
            });
            
            // Para camping, inicializar adultos y menores
            if (reserva.tipo_hospedaje === 'camping') {
                // Por defecto, asumir que todas las personas son adultos
                setCantidadAdultos(reserva.cantidad_personas.toString());
                setCantidadMenores('0');
            }
        }
    }, [isOpen, reserva]);

    const fetchTiposHospedaje = async () => {
        try {
            const response = await fetch(`${config.API_URL}/hospedajes.php?tipos`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al cargar tipos de hospedaje');
            const data = await response.json();
            if (data.success && Array.isArray(data.tipos)) {
                setTiposHospedaje(data.tipos);
                
                // Si no hay hospedaje_id, determinar el tipo por el nombre
                if (!reserva.hospedaje_id) {
                    const tipoActual = (reserva.tipo_hospedaje || '').toLowerCase();
                    const tipoEncontrado = data.tipos.find(tipo => 
                        (tipo.nombre || '').toLowerCase() === tipoActual
                    );
                    
                    if (tipoEncontrado) {
                        setTipoHospedajeSeleccionado(tipoEncontrado.id);
                        setTipoHospedajeNombre(tipoEncontrado.nombre);
                    }
                }
                return data.tipos;
            }
        } catch (error) {
            console.error('Error:', error);
            notify.error('Error al cargar tipos de hospedaje');
            return [];
        }
    };

    const fetchTipoHospedajeDelHospedaje = async (hospedajeId) => {
        try {
            const response = await fetch(`${config.API_URL}/hospedajes.php?id=${hospedajeId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al cargar hospedaje');
            const data = await response.json();
            if (data.success && data.hospedaje) {
                const tipoId = data.hospedaje.tipo_hospedaje_id;
                setTipoHospedajeSeleccionado(tipoId);
                
                // Buscar el nombre del tipo en los tipos ya cargados
                const tiposCargados = tiposHospedaje.length > 0 ? tiposHospedaje : await fetchTiposHospedaje();
                const tipoEncontrado = tiposCargados.find(t => t.id === tipoId);
                if (tipoEncontrado) {
                    setTipoHospedajeNombre(tipoEncontrado.nombre);
                }
                
                // Los hospedajes se cargarán automáticamente cuando se establezcan las fechas
                // mediante el useEffect que observa tipoHospedajeSeleccionado y formData
            }
        } catch (error) {
            console.error('Error:', error);
            notify.error('Error al cargar información del hospedaje');
        }
    };

    const fetchHospedajesDisponibles = async (tipoHospedajeId = null) => {
        try {
            setLoadingHospedajes(true);
            const tipoId = tipoHospedajeId || tipoHospedajeSeleccionado;
            
            if (!tipoId) {
                setHospedajes([]);
                return;
            }

            if (!formData.fecha_entrada || !formData.fecha_salida) {
                setHospedajes([]);
                return;
            }

            // Usar el mismo endpoint que la reserva rápida
            const url = `${config.API_URL}/hospedajes.php?disponibilidad=1&tipo_hospedaje_id=${tipoId}&fecha_entrada=${formData.fecha_entrada}&fecha_salida=${formData.fecha_salida}`;
            
            console.log('🔗 Obteniendo hospedajes disponibles en:', url);
            console.log('📋 Parámetros:', {
                tipoHospedajeId: tipoId,
                fecha_entrada: formData.fecha_entrada,
                fecha_salida: formData.fecha_salida
            });
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Respuesta no exitosa:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Hospedajes disponibles recibidos:', data);
            
            if (!data.success) {
                // Mostrar el mensaje de error detallado si está disponible
                const errorMessage = data.details || data.error || data.message || 'Error al cargar hospedajes';
                console.error('❌ Error del servidor:', errorMessage);
                throw new Error(errorMessage);
            }

            // Incluir el hospedaje actual si existe y no está en la lista
            const hospedajesDisponibles = (data.hospedajes || []).sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
            
            if (reserva.hospedaje_id && !hospedajesDisponibles.find(h => h.id === reserva.hospedaje_id)) {
                // Obtener información del hospedaje actual
                try {
                    const hospedajeResponse = await fetch(`${config.API_URL}/hospedajes.php?id=${reserva.hospedaje_id}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    const hospedajeData = await hospedajeResponse.json();
                    if (hospedajeData.success && hospedajeData.hospedaje) {
                        hospedajesDisponibles.push(hospedajeData.hospedaje);
                        // Reordenar después de agregar
                        hospedajesDisponibles.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
                    }
                } catch (error) {
                    console.error('Error al obtener hospedaje actual:', error);
                }
            }

            console.log('✅ Hospedajes disponibles actualizados:', hospedajesDisponibles?.length || 0);
            setHospedajes(hospedajesDisponibles);
        } catch (error) {
            console.error('❌ Error al cargar hospedajes disponibles:', error);
            console.error('🔍 Detalles del error:', error.message);
            notify.error(error.message || 'Error al cargar hospedajes disponibles');
            setHospedajes([]);
        } finally {
            setLoadingHospedajes(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Recalcular precio cuando cambien fechas, método de pago o descuento
        if ((field === 'fecha_entrada' || field === 'fecha_salida' || field === 'metodo_pago' || field === 'descuento') && 
            formData.fecha_entrada && formData.fecha_salida) {
            recalcularPrecio();
        }
    };

    const handleFechaChange = (dates) => {
        const [start, end] = dates;
        const nuevaFechaEntrada = start ? formatDateForInput(start) : '';
        const nuevaFechaSalida = end ? formatDateForInput(end) : '';
        
        setFormData(prev => ({
            ...prev,
            fecha_entrada: nuevaFechaEntrada,
            fecha_salida: nuevaFechaSalida
        }));

        // Recargar hospedajes disponibles si hay tipo seleccionado
        if (tipoHospedajeSeleccionado && nuevaFechaEntrada && nuevaFechaSalida) {
            fetchHospedajesDisponibles(tipoHospedajeSeleccionado);
        }
    };

    const handleTipoHospedajeChange = (e) => {
        const value = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        const nombre = selectedOption.text;
        
        setTipoHospedajeSeleccionado(value);
        setTipoHospedajeNombre(nombre);
        setHospedajeSeleccionado(''); // Limpiar hospedaje seleccionado
        setHospedajes([]);

        // Cargar hospedajes disponibles si hay fechas
        if (value && formData.fecha_entrada && formData.fecha_salida) {
            fetchHospedajesDisponibles(value);
        }
    };

    const handleHospedajeChange = (e) => {
        const value = e.target.value;
        setHospedajeSeleccionado(value);
    };

    const handleCantidadAdultosChange = (e) => {
        const value = e.target.value === '' ? '' : parseInt(e.target.value);
        setCantidadAdultos(value);
        
        // Actualizar cantidad_personas para camping
        const totalPersonas = (value === '' ? 0 : value) + (cantidadMenores === '' ? 0 : parseInt(cantidadMenores));
        handleInputChange('cantidad_personas', totalPersonas);
    };

    const handleCantidadMenoresChange = (e) => {
        const value = e.target.value === '' ? '' : parseInt(e.target.value);
        setCantidadMenores(value);
        
        // Actualizar cantidad_personas para camping
        const totalPersonas = (cantidadAdultos === '' ? 0 : parseInt(cantidadAdultos)) + (value === '' ? 0 : value);
        handleInputChange('cantidad_personas', totalPersonas);
    };

    const recalcularPrecio = async () => {
        if (!formData.fecha_entrada || !formData.fecha_salida || !formData.cantidad_personas) {
            return;
        }

        try {
            const fechaEntrada = new Date(formData.fecha_entrada);
            const fechaSalida = new Date(formData.fecha_salida);
            const diffTime = Math.abs(fechaSalida - fechaEntrada);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Determinar si es camping basado en el tipo seleccionado o el original
            const esCamping = tipoHospedajeNombre?.toLowerCase() === 'camping' || 
                             (tipoHospedajeNombre === '' && reserva.tipo_hospedaje === 'camping');
            
            // Para camping, necesitamos obtener los precios específicos
            if (esCamping) {
                const response = await fetch(`${config.API_URL}/hospedajes.php?precios_camping&metodo_pago=${formData.metodo_pago}`);
                
                if (!response.ok) throw new Error('Error al obtener precios');
                
                const data = await response.json();
                
                if (data.success && data.precios) {
                    const precios = data.precios;
                    const precioBase = parseFloat(precios.base);
                    const precioAdulto = parseFloat(precios.adulto);
                    const precioMenor = parseFloat(precios.menor);
                    
                    // Para camping, usar adultos y menores específicos
                    const adultos = cantidadAdultos === '' ? 0 : parseInt(cantidadAdultos);
                    const menores = cantidadMenores === '' ? 0 : parseInt(cantidadMenores);
                    const precioAdultos = adultos * precioAdulto;
                    const precioMenores = menores * precioMenor;
                    const precioPorDia = precioBase + precioAdultos + precioMenores;
                    const subtotal = precioPorDia * diffDays;
                    const descuentoValue = formData.descuento || 0;
                    // El monto_total debe ser el subtotal completo, sin restar la seña
                    // La seña se registrará como un pago inicial
                    const montoTotal = subtotal;

                    setFormData(prev => ({
                        ...prev,
                        monto_total: montoTotal
                    }));

                    // Actualizar el desglose de precio
                    setDesglosePrecio({
                        precioBase,
                        precioAdultos,
                        precioMenores,
                        precioPorDia,
                        cantidadDias: diffDays,
                        subtotal,
                        descuento: descuentoValue,
                        total: montoTotal
                    });
                }
            } else {
                // Para otros tipos de hospedaje, usar la lógica estándar
                // Obtener el tipo_hospedaje_id del tipo seleccionado
                if (!tipoHospedajeSeleccionado) {
                    console.warn('No se encontró tipo_hospedaje_id para calcular precio');
                    return;
                }
                
                const response = await fetch(`${config.API_URL}/hospedajes.php?precio&tipo_hospedaje_id=${tipoHospedajeSeleccionado}&cantidad_personas=${formData.cantidad_personas}&metodo_pago=${formData.metodo_pago}`);
                
                if (!response.ok) throw new Error('Error al obtener precio');
                
                const data = await response.json();
                
                if (data.success && data.precio) {
                    const precioPorDia = parseFloat(data.precio);
                    const subtotal = precioPorDia * diffDays;
                    const descuentoValue = formData.descuento || 0;
                    // El monto_total debe ser el subtotal completo, sin restar la seña
                    // La seña se registrará como un pago inicial
                    const montoTotal = subtotal;

                    setFormData(prev => ({
                        ...prev,
                        monto_total: montoTotal
                    }));

                    // Actualizar el desglose de precio para otros tipos
                    setDesglosePrecio({
                        precioBase: 0,
                        precioAdultos: 0,
                        precioMenores: 0,
                        precioPorDia,
                        cantidadDias: diffDays,
                        subtotal,
                        descuento: descuentoValue,
                        total: montoTotal
                    });
                }
            }
        } catch (error) {
            console.error('Error al recalcular precio:', error);
        }
    };

    // Efecto para recalcular precio cuando cambien las fechas, cantidades, método de pago o descuento
    useEffect(() => {
        if (formData.fecha_entrada && formData.fecha_salida && formData.cantidad_personas) {
            // Para camping, no necesitamos tipoHospedajeSeleccionado
            const esCamping = tipoHospedajeNombre?.toLowerCase() === 'camping' || 
                             (tipoHospedajeNombre === '' && reserva?.tipo_hospedaje === 'camping');
            if (esCamping || tipoHospedajeSeleccionado) {
                recalcularPrecio();
            }
        }
    }, [formData.fecha_entrada, formData.fecha_salida, formData.cantidad_personas, formData.metodo_pago, formData.descuento, cantidadAdultos, cantidadMenores, tipoHospedajeSeleccionado, tipoHospedajeNombre]);

    // Efecto para cargar hospedajes cuando cambie el tipo de hospedaje (solo si no es camping)
    useEffect(() => {
        if (tipoHospedajeSeleccionado && 
            tipoHospedajeNombre?.toLowerCase() !== 'camping' &&
            formData.fecha_entrada && 
            formData.fecha_salida) {
            console.log('🔄 Cargando hospedajes disponibles para tipo:', tipoHospedajeSeleccionado, 'con fechas:', formData.fecha_entrada, '-', formData.fecha_salida);
            fetchHospedajesDisponibles(tipoHospedajeSeleccionado);
        } else if (tipoHospedajeNombre?.toLowerCase() === 'camping') {
            // Si es camping, limpiar la lista de hospedajes
            setHospedajes([]);
        }
    }, [tipoHospedajeSeleccionado, tipoHospedajeNombre, formData.fecha_entrada, formData.fecha_salida]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validar fechas
            if (new Date(formData.fecha_entrada) >= new Date(formData.fecha_salida)) {
                throw new Error('La fecha de entrada debe ser anterior a la fecha de salida');
            }

            // Validar que no se edite en el pasado
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (new Date(formData.fecha_entrada) < hoy) {
                throw new Error('No se puede modificar una reserva para fechas pasadas');
            }

            // Preparar datos para enviar
            const datosActualizacion = {
                id: reserva.id,
                ...formData
            };

            // Incluir hospedaje_id si está seleccionado, o null si se cambió a camping
            if (hospedajeSeleccionado) {
                datosActualizacion.hospedaje_id = hospedajeSeleccionado;
            } else if (tipoHospedajeSeleccionado && tipoHospedajeNombre?.toLowerCase() === 'camping') {
                // Si se cambió a camping, enviar null
                datosActualizacion.hospedaje_id = null;
            }

            const response = await fetch(`${config.API_URL}/reservas.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizacion)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.details || 'Error al actualizar la reserva';
                throw new Error(errorMessage);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Error al actualizar la reserva');
            }

            notify.success('Reserva actualizada exitosamente');
            onReservaUpdated?.(reserva.id, formData);
            // Refrescar datos para ver los cambios inmediatamente
            if (onRefresh) {
                await onRefresh();
            }
            onClose();
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
            notify.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    const getClienteNombre = () => {
        return `${reserva?.apellido}, ${reserva?.nombre}`;
    };

    const getHospedajeNombre = () => {
        return `${reserva?.tipo_hospedaje} ${reserva?.numero_hospedaje}`;
    };

    if (!isOpen || !reserva) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="editar-reserva-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="editar-reserva-modal-header">
                    <h2>Editar Reserva</h2>
                    <button className="editar-reserva-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="editar-reserva-modal-body">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="reserva-info-summary">
                        <h3>Información de la Reserva</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>Cliente:</strong> {getClienteNombre()}
                            </div>
                            <div className="info-item">
                                <strong>Hospedaje:</strong> {getHospedajeNombre()}
                            </div>
                            <div className="info-item">
                                <strong>Estado:</strong> {reserva.estado || 'Activa'}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="editar-reserva-form">
                        <div className="form-section">
                            <h4><FaCalendar /> Fechas</h4>
                            <div className="date-picker-container">
                                <DatePicker
                                    selected={formData.fecha_entrada ? parseLocalDate(formData.fecha_entrada) : null}
                                    onChange={handleFechaChange}
                                    startDate={formData.fecha_entrada ? parseLocalDate(formData.fecha_entrada) : null}
                                    endDate={formData.fecha_salida ? parseLocalDate(formData.fecha_salida) : null}
                                    selectsRange
                                    minDate={getTodayStart()}
                                    dateFormat="dd/MM/yyyy"
                                    inline
                                    monthsShown={2}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    className="calendar"
                                    locale={es}
                                />
                            </div>
                            <div className="selected-dates">
                                <div className="date-item">
                                    <strong>Entrada:</strong> {formData.fecha_entrada ? formatDate(formData.fecha_entrada) : 'No seleccionada'}
                                </div>
                                <div className="date-item">
                                    <strong>Salida:</strong> {formData.fecha_salida ? formatDate(formData.fecha_salida) : 'No seleccionada'}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h4><FaHome /> Hospedaje</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="tipo_hospedaje">Tipo de Hospedaje</label>
                                    <select
                                        id="tipo_hospedaje"
                                        value={tipoHospedajeSeleccionado}
                                        onChange={handleTipoHospedajeChange}
                                        required
                                    >
                                        <option value="">Seleccione un tipo</option>
                                        {tiposHospedaje.map(tipo => (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {tipoHospedajeSeleccionado && tipoHospedajeNombre?.toLowerCase() !== 'camping' && (
                                    <div className="form-group">
                                        <label htmlFor="hospedaje_id">Hospedaje Específico</label>
                                        {loadingHospedajes ? (
                                            <div>Cargando hospedajes...</div>
                                        ) : (
                                            <select
                                                id="hospedaje_id"
                                                value={hospedajeSeleccionado}
                                                onChange={handleHospedajeChange}
                                                required
                                            >
                                                <option value="">Seleccione un hospedaje</option>
                                                {hospedajes.map(hospedaje => (
                                                    <option key={hospedaje.id} value={hospedaje.id}>
                                                        {hospedaje.numero} {hospedaje.tipo_hospedaje_nombre ? `(${hospedaje.tipo_hospedaje_nombre})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h4><FaUsers /> Detalles</h4>
                            {(tipoHospedajeNombre?.toLowerCase() === 'camping' || 
                              (tipoHospedajeNombre === '' && reserva.tipo_hospedaje === 'camping')) ? (
                                <>
                                    <div className="camping-info-message">
                                        <p>
                                            <strong>💡 Nota importante:</strong> La base de datos solo guarda la cantidad total de personas. 
                                            Por favor, aclara la distribución correcta de adultos y menores para calcular el precio exacto.
                                        </p>
                                    </div>
                                    {/* Campos específicos para camping */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cantidad_adultos">
                                            <FaUser /> Adultos
                                        </label>
                                        <input
                                            type="number"
                                            id="cantidad_adultos"
                                            value={cantidadAdultos}
                                            onChange={handleCantidadAdultosChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cantidad_menores">
                                            <FaChild /> Menores
                                        </label>
                                        <input
                                            type="number"
                                            id="cantidad_menores"
                                            value={cantidadMenores}
                                            onChange={handleCantidadMenoresChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="monto_total">Monto Total</label>
                                        <input
                                            type="number"
                                            id="monto_total"
                                            value={formData.monto_total}
                                            onChange={(e) => handleInputChange('monto_total', e.target.value)}
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                                </>
                            ) : (
                                // Campos estándar para otros tipos
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cantidad_personas">Cantidad de Personas</label>
                                        <input
                                            type="number"
                                            id="cantidad_personas"
                                            value={formData.cantidad_personas}
                                            onChange={(e) => handleInputChange('cantidad_personas', e.target.value)}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="monto_total">Monto Total</label>
                                        <input
                                            type="number"
                                            id="monto_total"
                                            value={formData.monto_total}
                                            onChange={(e) => handleInputChange('monto_total', e.target.value)}
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Desglose de precio en tiempo real */}
                            {formData.fecha_entrada && formData.fecha_salida && formData.cantidad_personas && (
                                <div className="desglose-precio">
                                    <h4>Desglose del Precio</h4>
                                    {(tipoHospedajeNombre?.toLowerCase() === 'camping' || 
                                      (tipoHospedajeNombre === '' && reserva.tipo_hospedaje === 'camping')) ? (
                                        <>
                                            <div className="desglose-item">
                                                <span>Precio Base por día:</span>
                                                <span>${desglosePrecio.precioBase.toLocaleString()}</span>
                                            </div>
                                            {cantidadAdultos !== '' && parseInt(cantidadAdultos) > 0 && (
                                                <div className="desglose-item">
                                                    <span>Precio por {cantidadAdultos} adulto(s):</span>
                                                    <span>${desglosePrecio.precioAdultos.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {cantidadMenores !== '' && parseInt(cantidadMenores) > 0 && (
                                                <div className="desglose-item">
                                                    <span>Precio por {cantidadMenores} menor(es):</span>
                                                    <span>${desglosePrecio.precioMenores.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="desglose-item">
                                                <span>Precio total por día:</span>
                                                <span>${desglosePrecio.precioPorDia.toLocaleString()}</span>
                                            </div>
                                        </>
                                    ) : null}
                                    <div className="desglose-item">
                                        <span>Cantidad de días:</span>
                                        <span>{desglosePrecio.cantidadDias}</span>
                                    </div>
                                    <div className="desglose-item">
                                        <span>Subtotal:</span>
                                        <span>${desglosePrecio.subtotal ? desglosePrecio.subtotal.toLocaleString() : '0.00'}</span>
                                    </div>
                                    <div className="desglose-item">
                                        <span>Seña:</span>
                                        <span>-${desglosePrecio.descuento ? desglosePrecio.descuento.toLocaleString() : '0.00'}</span>
                                    </div>
                                    <div className="desglose-item total">
                                        <span>Total final:</span>
                                        <span>${desglosePrecio.total ? desglosePrecio.total.toLocaleString() : '0.00'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h4><FaMoneyBillWave /> Pago</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="metodo_pago">Método de Pago</label>
                                    <select
                                        id="metodo_pago"
                                        value={formData.metodo_pago}
                                        onChange={(e) => handleInputChange('metodo_pago', e.target.value)}
                                        required
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="transferencia">Transferencia</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="descuento">
                                        <FaPercent /> Seña
                                    </label>
                                    <input
                                        type="number"
                                        id="descuento"
                                        value={formData.descuento}
                                        onChange={(e) => handleInputChange('descuento', e.target.value)}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h4><FaComment /> Observaciones</h4>
                            <div className="form-group">
                                <textarea
                                    id="observaciones"
                                    value={formData.observaciones}
                                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                                    rows="3"
                                    placeholder="Observaciones adicionales..."
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h4>Estado</h4>
                            <div className="form-group">
                                <select
                                    id="estado"
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange('estado', e.target.value)}
                                    required
                                >
                                    <option value="activa">Activa</option>
                                    <option value="finalizada">Finalizada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>
                        </div>

                        {/* Gestión de Pagos */}
                        <div className="form-section gestion-pagos-section">
                            <GestionPagos
                                reservaId={reserva.id}
                                montoTotal={formData.monto_total}
                                onPagoActualizado={async () => {
                                    // Refrescar la lista de reservas para actualizar total_pagado y estado_pago
                                    if (onRefresh) {
                                        await onRefresh();
                                    }
                                    setRefreshReserva(prev => prev + 1);
                                    // Notificar al componente padre para actualizar ResumenPagos
                                    if (onPagoActualizado) {
                                        onPagoActualizado();
                                    }
                                }}
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                <FaUndo /> Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn-save"
                                disabled={loading}
                            >
                                <FaSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarReservaModal; 