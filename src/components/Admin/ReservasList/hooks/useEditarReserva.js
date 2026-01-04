import { useState, useEffect, useCallback, useRef } from 'react';
import { notify } from '../../Notifications/NotificationSystem';
import reservaService from '../../../../services/reservaService';
import useHospedajes from '../../../../hooks/useHospedajes';
import precioService from '../../../../services/precioService';

/**
 * Hook para manejar toda la lógica de edición de reservas
 */
export const useEditarReserva = (reserva, isOpen, onReservaUpdated, onRefresh, onClose) => {
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
    
    // Hook compartido para hospedajes
    const {
        tiposHospedaje,
        hospedajesDisponibles,
        loading: loadingHospedajes,
        fetchTiposHospedaje: fetchTiposHospedajeHook,
        fetchHospedajesDisponibles: fetchHospedajesDisponiblesHook,
        getHospedajeById: getHospedajeByIdHook,
        getTipoHospedajeDelHospedaje: getTipoHospedajeDelHospedajeHook
    } = useHospedajes();
    
    const [tipoHospedajeSeleccionado, setTipoHospedajeSeleccionado] = useState('');
    const [tipoHospedajeNombre, setTipoHospedajeNombre] = useState('');
    const [hospedajeSeleccionado, setHospedajeSeleccionado] = useState('');
    const [refreshReserva, setRefreshReserva] = useState(0);
    
    // Ref para rastrear el último tipo de hospedaje cargado (evitar loops infinitos)
    const lastTipoCargadoRef = useRef(null);
    const lastFechasCargadasRef = useRef({ entrada: null, salida: null });
    
    // Ref para evitar inicialización múltiple
    const inicializadoRef = useRef(false);
    const reservaIdRef = useRef(null);
    const cargandoTipoRef = useRef(false);
    
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

    // Cargar tipos de hospedaje cuando se abre el modal (solo una vez)
    useEffect(() => {
        if (isOpen && reserva && !inicializadoRef.current) {
            fetchTiposHospedajeHook({ includeHospedajes: true });
        }
    }, [isOpen, reserva?.id, fetchTiposHospedajeHook]);

    // Inicializar datos cuando se abre el modal
    useEffect(() => {
        // Solo inicializar si el modal está abierto, hay una reserva, y no se ha inicializado para esta reserva
        if (!isOpen || !reserva) {
            // Resetear cuando se cierra el modal
            if (!isOpen) {
                inicializadoRef.current = false;
                reservaIdRef.current = null;
                cargandoTipoRef.current = false;
            }
            return;
        }

        // Si ya se inicializó para esta reserva, no hacer nada
        if (inicializadoRef.current && reservaIdRef.current === reserva.id) {
            return;
        }

        // Marcar como inicializado para esta reserva
        inicializadoRef.current = true;
        reservaIdRef.current = reserva.id;
        
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

        // Inicializar hospedaje actual - usar un efecto separado para evitar loops
        if (reserva.hospedaje_id) {
            setHospedajeSeleccionado(reserva.hospedaje_id);
        } else {
            setHospedajeSeleccionado('');
        }

        // Inicializar cantidad de adultos y menores para camping
        // Nota: La base de datos solo guarda cantidad_personas total, así que inicializamos con valores por defecto
        if (reserva.tipo_hospedaje === 'camping') {
            setCantidadAdultos(reserva.cantidad_personas || '');
            setCantidadMenores('0');
        }
    }, [isOpen, reserva?.id]);

    // Efecto separado para cargar el tipo de hospedaje cuando se carguen los tipos
    useEffect(() => {
        if (!isOpen || !reserva || !tiposHospedaje.length || cargandoTipoRef.current) {
            return;
        }

        // Si ya se inicializó el tipo para esta reserva, no hacer nada
        if (tipoHospedajeSeleccionado && reservaIdRef.current === reserva.id) {
            return;
        }

        // Verificar si ya se intentó cargar el tipo para esta reserva
        const tipoCargadoKey = `tipo_${reserva.id}`;
        if (lastTipoCargadoRef.current === tipoCargadoKey) {
            return;
        }

        cargandoTipoRef.current = true;
        lastTipoCargadoRef.current = tipoCargadoKey;

        const cargarTipoHospedaje = async () => {
            try {
                if (reserva.hospedaje_id) {
                    // Obtener el hospedaje directamente y buscar el tipo en tiposHospedaje
                    // Evitar llamar a getTipoHospedajeDelHospedaje que puede causar loops
                    const hospedaje = await getHospedajeByIdHook(reserva.hospedaje_id);
                    if (hospedaje && hospedaje.tipo_hospedaje_id && reservaIdRef.current === reserva.id) {
                        const tipo = tiposHospedaje.find(t => t.id == hospedaje.tipo_hospedaje_id);
                        if (tipo) {
                            setTipoHospedajeSeleccionado(tipo.id);
                            setTipoHospedajeNombre(tipo.nombre);
                        }
                    }
                } else if (reserva.tipo_hospedaje === 'camping') {
                    // Si no hay hospedaje_id, es camping
                    const tipoCamping = tiposHospedaje.find(t => t.nombre.toLowerCase() === 'camping');
                    if (tipoCamping && reservaIdRef.current === reserva.id) {
                        setTipoHospedajeSeleccionado(tipoCamping.id);
                        setTipoHospedajeNombre(tipoCamping.nombre);
                    }
                }
            } catch (error) {
                console.error('Error al cargar tipo de hospedaje:', error);
            } finally {
                cargandoTipoRef.current = false;
            }
        };

        cargarTipoHospedaje();
    }, [isOpen, reserva?.id, reserva?.hospedaje_id, reserva?.tipo_hospedaje, tiposHospedaje.length, getHospedajeByIdHook]);

    // Ref para evitar llamadas múltiples simultáneas
    const fetchingRef = useRef(false);

    // Función para obtener hospedajes disponibles (usando useCallback para evitar recreaciones)
    const fetchHospedajesDisponibles = useCallback(async (tipoHospedajeId, hospedajeIdIncluir = null) => {
        // Evitar llamadas múltiples simultáneas
        if (fetchingRef.current) {
            return;
        }

        try {
            if (!tipoHospedajeId || !formData.fecha_entrada || !formData.fecha_salida) {
                return;
            }

            fetchingRef.current = true;

            // fetchHospedajesDisponiblesHook ya actualiza hospedajesDisponibles y loading automáticamente
            // No necesitamos llamar a setHospedajes manualmente
            await fetchHospedajesDisponiblesHook(
                tipoHospedajeId,
                formData.fecha_entrada,
                formData.fecha_salida,
                { 
                    useDisponibilidadEndpoint: true,
                    includeHospedajeId: hospedajeIdIncluir // Incluir el hospedaje actual si está seleccionado
                }
            );
        } catch (error) {
            console.error('Error al cargar hospedajes disponibles:', error);
            notify.error('Error al cargar hospedajes disponibles');
        } finally {
            fetchingRef.current = false;
        }
    }, [formData.fecha_entrada, formData.fecha_salida, fetchHospedajesDisponiblesHook]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFechaChange = (dates) => {
        const [start, end] = dates;
        if (start) {
            setFormData(prev => ({
                ...prev,
                fecha_entrada: start.toISOString().split('T')[0]
            }));
        }
        if (end) {
            setFormData(prev => ({
                ...prev,
                fecha_salida: end.toISOString().split('T')[0]
            }));
        }
    };

    const handleTipoHospedajeChange = async (e) => {
        const tipoId = e.target.value;
        setTipoHospedajeSeleccionado(tipoId);
        
        const tipo = tiposHospedaje.find(t => t.id == tipoId);
        if (tipo) {
            setTipoHospedajeNombre(tipo.nombre);
        } else {
            setTipoHospedajeNombre('');
        }
        
        // Limpiar hospedaje seleccionado cuando cambia el tipo
        setHospedajeSeleccionado('');
        
        // Si no es camping y hay fechas, el useEffect cargará los hospedajes automáticamente
        // No necesitamos hacer nada aquí
    };

    const handleHospedajeChange = (e) => {
        setHospedajeSeleccionado(e.target.value);
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

    // Ref para evitar cálculos múltiples simultáneos
    const calculatingRef = useRef(false);

    const recalcularPrecio = useCallback(async () => {
        // Evitar cálculos múltiples simultáneos
        if (calculatingRef.current) {
            return;
        }

        if (!formData.fecha_entrada || !formData.fecha_salida || !formData.cantidad_personas) {
            return;
        }

        try {
            calculatingRef.current = true;

            // Determinar si es camping basado en el tipo seleccionado o el original
            const esCamping = tipoHospedajeNombre?.toLowerCase() === 'camping' || 
                             (tipoHospedajeNombre === '' && reserva?.tipo_hospedaje === 'camping');
            
            // Para camping, necesitamos obtener los precios específicos
            if (esCamping) {
                const adultos = cantidadAdultos === '' ? 0 : parseInt(cantidadAdultos);
                const menores = cantidadMenores === '' ? 0 : parseInt(cantidadMenores);
                
                const resultado = await precioService.calcularPrecioCamping(
                    formData.fecha_entrada,
                    formData.fecha_salida,
                    formData.metodo_pago,
                    adultos,
                    menores
                );
                
                const descuentoValue = formData.descuento || 0;
                const montoTotal = precioService.recalcularPrecioConDescuento(resultado.subtotal, descuentoValue);

                setFormData(prev => ({
                    ...prev,
                    monto_total: montoTotal
                }));

                // Actualizar el desglose de precio
                setDesglosePrecio({
                    precioBase: resultado.precioBase,
                    precioAdultos: resultado.precioAdulto * resultado.adultos,
                    precioMenores: resultado.precioMenor * resultado.menores,
                    precioPorDia: resultado.precioPorDia,
                    cantidadDias: resultado.cantidadDias,
                    subtotal: resultado.subtotal,
                    descuento: descuentoValue,
                    total: montoTotal
                });
            } else {
                // Para otros tipos de hospedaje, usar la lógica estándar
                if (!tipoHospedajeSeleccionado) {
                    console.warn('No se encontró tipo_hospedaje_id para calcular precio');
                    return;
                }
                
                const resultado = await precioService.calcularPrecioAutomatico(
                    tipoHospedajeSeleccionado,
                    formData.cantidad_personas,
                    formData.fecha_entrada,
                    formData.fecha_salida,
                    formData.metodo_pago
                );
                
                const descuentoValue = formData.descuento || 0;
                const montoTotal = precioService.recalcularPrecioConDescuento(resultado.subtotal, descuentoValue);

                setFormData(prev => ({
                    ...prev,
                    monto_total: montoTotal
                }));

                // Actualizar el desglose de precio para otros tipos
                setDesglosePrecio({
                    precioBase: 0,
                    precioAdultos: 0,
                    precioMenores: 0,
                    precioPorDia: resultado.precioPorDia,
                    cantidadDias: resultado.cantidadDias,
                    subtotal: resultado.subtotal,
                    descuento: descuentoValue,
                    total: montoTotal
                });
            }
        } catch (error) {
            console.error('Error al recalcular precio:', error);
            notify.error(`Error al recalcular precio: ${error.message}`);
        } finally {
            calculatingRef.current = false;
        }
    }, [formData.fecha_entrada, formData.fecha_salida, formData.cantidad_personas, formData.metodo_pago, formData.descuento, cantidadAdultos, cantidadMenores, tipoHospedajeSeleccionado, tipoHospedajeNombre, reserva]);

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
    }, [formData.fecha_entrada, formData.fecha_salida, formData.cantidad_personas, formData.metodo_pago, formData.descuento, cantidadAdultos, cantidadMenores, tipoHospedajeSeleccionado, tipoHospedajeNombre, recalcularPrecio, reserva]);

    // Efecto para cargar hospedajes cuando cambie el tipo de hospedaje (solo si no es camping)
    useEffect(() => {
        // Solo ejecutar si tenemos todos los datos necesarios
        if (!tipoHospedajeSeleccionado || !formData.fecha_entrada || !formData.fecha_salida) {
            return;
        }

        const esCamping = tipoHospedajeNombre?.toLowerCase() === 'camping';
        
        if (esCamping) {
            // Si es camping, marcar como cargado pero no hacer nada más
            // (no necesitamos limpiar hospedajesDisponibles porque no se mostrará)
            if (lastTipoCargadoRef.current !== 'camping') {
                lastTipoCargadoRef.current = 'camping';
            }
            return;
        }

        // Verificar si ya cargamos para este tipo y fechas
        const fechasCambiaron = 
            lastFechasCargadasRef.current.entrada !== formData.fecha_entrada ||
            lastFechasCargadasRef.current.salida !== formData.fecha_salida;
        
        const tipoCambio = lastTipoCargadoRef.current !== tipoHospedajeSeleccionado;

        // Solo cargar si cambió el tipo o las fechas, y no está ya cargando
        if ((tipoCambio || fechasCambiaron) && !fetchingRef.current) {
            console.log('🔄 Cargando hospedajes disponibles para tipo:', tipoHospedajeSeleccionado, 'con fechas:', formData.fecha_entrada, '-', formData.fecha_salida);
            // Pasar el hospedaje seleccionado actual para incluirlo si no está disponible
            fetchHospedajesDisponibles(tipoHospedajeSeleccionado, hospedajeSeleccionado || null);
            
            // Actualizar referencias
            lastTipoCargadoRef.current = tipoHospedajeSeleccionado;
            lastFechasCargadasRef.current = {
                entrada: formData.fecha_entrada,
                salida: formData.fecha_salida
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoHospedajeSeleccionado, tipoHospedajeNombre, formData.fecha_entrada, formData.fecha_salida, hospedajeSeleccionado]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validar fechas
            if (new Date(formData.fecha_entrada) >= new Date(formData.fecha_salida)) {
                throw new Error('La fecha de entrada debe ser anterior a la fecha de salida');
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

            await reservaService.updateReserva(reserva.id, datosActualizacion);

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

    return {
        // Estados
        formData,
        cantidadAdultos,
        cantidadMenores,
        loading,
        error,
        tiposHospedaje,
        hospedajesDisponibles,
        loadingHospedajes,
        tipoHospedajeSeleccionado,
        tipoHospedajeNombre,
        hospedajeSeleccionado,
        refreshReserva,
        setRefreshReserva,
        desglosePrecio,
        getTodayStart,
        
        // Funciones
        handleInputChange,
        handleFechaChange,
        handleTipoHospedajeChange,
        handleHospedajeChange,
        handleCantidadAdultosChange,
        handleCantidadMenoresChange,
        handleSubmit,
        handleCancel
    };
};
