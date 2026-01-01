import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useAdmin from '../../hooks/useAdmin';
import config from '../../../../config';

export const useReservaRapida = () => {
    const {
        clientes,
        fetchClientes,
        handleCreateCliente,
        handleCreateReserva,
        forceReload
    } = useAdmin();

    // Estados del formulario
    const [formData, setFormData] = useState({
        // Datos del cliente
        nombre: '',
        apellido: '',
        documento: '',
        telefono: '',
        modelo_vehiculo: '',
        patente: '',
        
        // Datos de la reserva
        fecha_entrada: '',
        fecha_salida: '',
        tipo_hospedaje: '',
        numero_hospedaje: '',
        cantidad_personas: 1,
        monto_total: '',
        observaciones: '',
        estado: 'activa',
        metodo_pago: 'efectivo',
        descuento: 0,
        tipo_descuento: '', // 'monto' o 'porcentaje'
        valor_descuento: '' // valor del descuento
    });

    // Estados de la aplicación
    const [tiposHospedaje, setTiposHospedaje] = useState([]);
    const [hospedajes, setHospedajes] = useState([]);
    const [hospedajesDisponibles, setHospedajesDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [clienteExistente, setClienteExistente] = useState(null);
    const [verificandoDisponibilidad, setVerificandoDisponibilidad] = useState(false);
    const [calculandoPrecio, setCalculandoPrecio] = useState(false);
    const [cantidadesDisponibles, setCantidadesDisponibles] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [cantidadAdultos, setCantidadAdultos] = useState('0');
    const [cantidadMenores, setCantidadMenores] = useState('0');
    const [cantidadNoches, setCantidadNoches] = useState(null);
    
    // Ref para el debounce del descuento
    const descuentoTimeoutRef = useRef(null);

    // Cargar datos iniciales
    useEffect(() => {
        fetchClientes();
        fetchTiposHospedaje();
    }, []);

    // Calcular noches cuando cambien las fechas
    useEffect(() => {
        if (!formData.fecha_entrada || !formData.fecha_salida) {
            setCantidadNoches(null);
            return;
        }

        // Validar formato de fecha
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(formData.fecha_entrada) || !regex.test(formData.fecha_salida)) {
            setCantidadNoches(null);
            return;
        }

        const fechaEntradaObj = new Date(formData.fecha_entrada);
        const fechaSalidaObj = new Date(formData.fecha_salida);

        // Verificar que sean fechas válidas
        if (isNaN(fechaEntradaObj.getTime()) || isNaN(fechaSalidaObj.getTime())) {
            setCantidadNoches(null);
            return;
        }

        // Verificar que la fecha de salida sea posterior a la de entrada
        if (fechaSalidaObj <= fechaEntradaObj) {
            setCantidadNoches(null);
            return;
        }

        // Calcular la diferencia en milisegundos
        const diffTime = fechaSalidaObj - fechaEntradaObj;
        // Convertir a días (noches)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        setCantidadNoches(diffDays);
    }, [formData.fecha_entrada, formData.fecha_salida]);

    // Función para obtener la URL de la API según el entorno
    const getApiUrl = (endpoint, params = '') => {
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDev) {
            return `http://localhost/campinglasorpresa/api/endpoints/${endpoint}${params}`;
        } else {
            // En producción, usar config.API_URL como las otras pestañas
            return `${config.API_URL}/${endpoint}${params}`;
        }
    };

    // Función para cargar tipos de hospedaje
    const fetchTiposHospedaje = async () => {
        try {
            const apiUrl = getApiUrl('hospedajes.php');
            
            console.log('🔗 Intentando conectar a:', apiUrl);
            console.log('🌍 Hostname:', window.location.hostname);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Status de respuesta:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Respuesta no exitosa:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Datos recibidos de hospedajes:', data);
            
            if (data.success) {
                // Ordenar tipos de hospedaje por ID numérico
                const tiposOrdenados = (data.tipos_hospedaje || []).sort((a, b) => parseInt(a.id) - parseInt(b.id));
                setTiposHospedaje(tiposOrdenados);
                setHospedajes(data.hospedajes || []);
                console.log('✅ Tipos de hospedaje cargados y ordenados:', tiposOrdenados?.length || 0);
                console.log('✅ Hospedajes cargados:', data.hospedajes?.length || 0);
            } else {
                console.error('❌ Error en la respuesta:', data.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error al cargar tipos de hospedaje:', error);
            console.error('🔍 Detalles del error:', error.message);
            toast.error(`Error al cargar tipos de hospedaje: ${error.message}`);
        }
    };

    // Función para obtener cantidades disponibles
    const obtenerCantidadesDisponibles = async (tipoHospedajeId) => {
        try {
            if (!tipoHospedajeId) {
                setCantidadesDisponibles([]);
                return;
            }

            console.log('🔢 Obteniendo cantidades disponibles para tipo:', tipoHospedajeId);
            
            const apiUrl = getApiUrl('hospedajes.php', `?cantidades_personas=1&tipo_hospedaje_id=${tipoHospedajeId}`);
            
            console.log('🔗 Obteniendo cantidades en:', apiUrl);
            
            const response = await fetch(apiUrl, {
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
            console.log('📊 Cantidades disponibles recibidas:', data);
            
            if (data.success && data.cantidades) {
                setCantidadesDisponibles(data.cantidades);
                console.log('✅ Cantidades disponibles actualizadas:', data.cantidades);
            } else {
                console.error('❌ Error en la respuesta:', data.error || 'Error desconocido');
                setCantidadesDisponibles(getCantidadesPorDefecto(tipoHospedajeId));
            }
        } catch (error) {
            console.error('❌ Error al obtener cantidades disponibles:', error);
            console.error('🔍 Detalles del error:', error.message);
            setCantidadesDisponibles(getCantidadesPorDefecto(tipoHospedajeId));
        }
    };

    // Función para obtener cantidades por defecto
    const getCantidadesPorDefecto = (tipoHospedajeId) => {
        switch (parseInt(tipoHospedajeId)) {
            case 1: // Cabaña
                return [2, 3, 4, 5];
            case 2: // Dormis
                return [2, 3, 4];
            case 3: // Camping
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            case 4: // Grupos
                return [10, 15, 20, 25, 30, 35, 40, 45, 50];
            default:
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }
    };

    // Función para aplicar descuento al monto
    const aplicarDescuento = (subtotal, tipoDescuento = null, valorDescuento = null) => {
        // Usar valores pasados como parámetros o los del formData
        const tipo = tipoDescuento !== null ? tipoDescuento : formData.tipo_descuento;
        const valor = valorDescuento !== null ? valorDescuento : formData.valor_descuento;
        
        if (!tipo || !valor) {
            return subtotal;
        }
        
        const valorNum = parseFloat(valor) || 0;
        if (valorNum <= 0) {
            return subtotal;
        }
        
        let montoDescuento = 0;
        if (tipo === 'porcentaje') {
            // Aplicar descuento porcentual
            montoDescuento = (subtotal * valorNum) / 100;
        } else if (tipo === 'monto') {
            // Aplicar descuento fijo
            montoDescuento = valorNum;
        }
        
        // Asegurar que el descuento no sea mayor que el subtotal
        montoDescuento = Math.min(montoDescuento, subtotal);
        
        return Math.max(0, subtotal - montoDescuento);
    };

    // Función para calcular precio de camping
    const calcularPrecioCamping = async (fechaEntrada, fechaSalida, metodoPago = 'efectivo', adultosActuales = null, menoresActuales = null) => {
        try {
            setCalculandoPrecio(true);
            console.log('🏕️ Calculando precio de camping para:', { fechaEntrada, fechaSalida, metodoPago });
            
            const apiUrl = getApiUrl('hospedajes.php', `?precios_camping&metodo_pago=${metodoPago}`);
            console.log('🔗 URL de la API camping:', apiUrl);
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.success && data.precios) {
                const precios = data.precios;
                const fechaEntradaObj = new Date(fechaEntrada);
                const fechaSalidaObj = new Date(fechaSalida);
                const diffTime = Math.abs(fechaSalidaObj - fechaEntradaObj);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Calcular precios individuales
                const precioBase = parseFloat(precios.base);
                const adultos = adultosActuales !== null ? parseInt(adultosActuales) || 0 : (parseInt(cantidadAdultos) || 0);
                const menores = menoresActuales !== null ? parseInt(menoresActuales) || 0 : (parseInt(cantidadMenores) || 0);
                const precioAdultos = adultos * parseFloat(precios.adulto);
                const precioMenores = menores * parseFloat(precios.menor);
                const precioPorDia = precioBase + precioAdultos + precioMenores;
                const subtotalCalculado = precioPorDia * diffDays;
                const descuentoValue = parseFloat(formData.descuento) || 0;
                
                // Aplicar descuento al subtotal
                const montoTotal = aplicarDescuento(subtotalCalculado);
                
                console.log('📊 Cálculo camping:', { 
                    precioBase, adultos, menores, precioAdultos, precioMenores, 
                    precioPorDia, diffDays, subtotalCalculado, montoTotal 
                });
                
                setSubtotal(subtotalCalculado);
                setFormData(prev => ({
                    ...prev,
                    monto_total: montoTotal
                }));
                
                if (descuentoValue > 0) {
                    toast.success(`🏕️ Precio camping calculado: $${montoTotal} (Seña: $${descuentoValue}, Falta pagar: $${montoTotal - descuentoValue})`);
                } else {
                    toast.success(`🏕️ Precio camping calculado: $${montoTotal} (${diffDays} días × $${precioPorDia})`);
                }
            } else {
                console.error('❌ Error en la respuesta de precios camping:', data.error || 'Error desconocido');
                toast.error(`Error al calcular precio camping: ${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('❌ Error al calcular precio camping:', error);
            toast.error(`Error al calcular precio camping: ${error.message}`);
        } finally {
            setCalculandoPrecio(false);
        }
    };

    // Función para calcular precio automático
    const calcularPrecioAutomatico = async (tipoHospedajeId, cantidadPersonas, fechaEntrada, fechaSalida, metodoPago = 'efectivo') => {
        try {
            if (!tipoHospedajeId || !cantidadPersonas || !fechaEntrada || !fechaSalida) {
                return;
            }

            if (!esFechaValida(fechaEntrada) || !esFechaValida(fechaSalida)) {
                return;
            }

            setCalculandoPrecio(true);
            console.log('💰 Calculando precio automático para:', { tipoHospedajeId, cantidadPersonas, fechaEntrada, fechaSalida, metodoPago });
            
            const apiUrl = getApiUrl('hospedajes.php', `?precio&tipo_hospedaje_id=${tipoHospedajeId}&cantidad_personas=${cantidadPersonas}&metodo_pago=${metodoPago}`);
            
            console.log('🔗 Calculando precio en:', apiUrl);
            
            const response = await fetch(apiUrl, {
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
            console.log('💰 Precio recibido:', data);
            
            if (data.success && data.precio) {
                const fechaEntradaObj = new Date(fechaEntrada);
                const fechaSalidaObj = new Date(fechaSalida);
                const diffTime = Math.abs(fechaSalidaObj - fechaEntradaObj);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                const precioPorDia = parseFloat(data.precio);
                const subtotalCalculado = precioPorDia * diffDays;
                const descuentoValue = parseFloat(formData.descuento) || 0;
                
                // Aplicar descuento al subtotal
                const montoTotal = aplicarDescuento(subtotalCalculado);
                
                console.log('📊 Cálculo:', { precioPorDia, diffDays, subtotalCalculado, montoTotal });
                
                setSubtotal(subtotalCalculado);
                setFormData(prev => ({
                    ...prev,
                    monto_total: montoTotal
                }));
                
                if (descuentoValue > 0) {
                    toast.success(`💰 Precio calculado: $${montoTotal} (Seña: $${descuentoValue}, Falta pagar: $${montoTotal - descuentoValue})`);
                } else {
                    toast.success(`💰 Precio calculado: $${montoTotal} (${diffDays} días × $${precioPorDia})`);
                }
            } else {
                console.error('❌ Error en la respuesta de precio:', data.error || 'Error desconocido');
                toast.error(`Error al calcular precio: ${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('❌ Error al calcular precio:', error);
            console.error('🔍 Detalles del error:', error.message);
            toast.error(`Error al calcular precio: ${error.message}`);
        } finally {
            setCalculandoPrecio(false);
        }
    };

    // Función para verificar disponibilidad
    const verificarDisponibilidadHospedajes = async (tipoHospedajeId, fechaEntrada, fechaSalida) => {
        try {
            if (!tipoHospedajeId || !fechaEntrada || !fechaSalida) {
                console.warn('⚠️ Parámetros incompletos para verificar disponibilidad');
                return;
            }
            
            if (!esFechaValida(fechaEntrada) || !esFechaValida(fechaSalida)) {
                console.warn('⚠️ Fechas inválidas para verificar disponibilidad:', { fechaEntrada, fechaSalida });
                toast.error('⚠️ Las fechas seleccionadas no son válidas');
                return;
            }
            
            setVerificandoDisponibilidad(true);
            console.log('🔍 Verificando disponibilidad para:', { tipoHospedajeId, fechaEntrada, fechaSalida });
            
            const apiUrl = getApiUrl('hospedajes.php', `?disponibilidad=1&tipo_hospedaje_id=${tipoHospedajeId}&fecha_entrada=${fechaEntrada}&fecha_salida=${fechaSalida}`);
            
            console.log('🔗 Verificando disponibilidad en:', apiUrl);
            
            const response = await fetch(apiUrl, {
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
            
            if (data.success) {
                // Ordenar hospedajes disponibles por número
                const hospedajesOrdenados = (data.hospedajes || []).sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
                setHospedajesDisponibles(hospedajesOrdenados);
                console.log('✅ Hospedajes disponibles actualizados:', hospedajesOrdenados?.length || 0);
                
                // Solo mostrar advertencia si no es camping ni grupos (que son ilimitados)
                if (data.hospedajes && data.hospedajes.length === 0 && tipoHospedajeId !== '3' && tipoHospedajeId !== '4') {
                    toast.warning('⚠️ No hay hospedajes disponibles para las fechas seleccionadas');
                }
            } else {
                console.error('❌ Error en la respuesta:', data.error || 'Error desconocido');
                toast.error(`Error al verificar disponibilidad: ${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('❌ Error al verificar disponibilidad:', error);
            console.error('🔍 Detalles del error:', error.message);
            toast.error(`Error al verificar disponibilidad: ${error.message}`);
        } finally {
            setVerificandoDisponibilidad(false);
        }
    };

    // Función para validar fechas
    const esFechaValida = (fecha) => {
        if (!fecha) return false;
        
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(fecha)) {
            console.warn('⚠️ Formato de fecha inválido:', fecha);
            return false;
        }
        
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
            console.warn('⚠️ Fecha no válida:', fecha);
            return false;
        }
        
        const hoy = new Date();
        const diezAnos = new Date();
        diezAnos.setFullYear(hoy.getFullYear() + 10);
        
        if (fechaObj > diezAnos) {
            console.warn('⚠️ Fecha muy futura:', fecha);
            return false;
        }
        
        return true;
    };

    // Función para buscar cliente existente
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

    // Función para limpiar formulario
    const limpiarFormulario = () => {
        setFormData({
            nombre: '',
            apellido: '',
            documento: '',
            telefono: '',
            modelo_vehiculo: '',
            patente: '',
            fecha_entrada: '',
            fecha_salida: '',
            tipo_hospedaje: '',
            numero_hospedaje: '',
            cantidad_personas: 1,
            monto_total: '',
            observaciones: '',
            estado: 'activa',
            metodo_pago: 'efectivo',
            descuento: 0,
            tipo_descuento: '',
            valor_descuento: ''
        });
        setClienteExistente(null);
        setCantidadesDisponibles([]);
        setSubtotal(0);
        setCantidadAdultos('0');
        setCantidadMenores('0');
        setCantidadNoches(null);
    };

    // Función para manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'documento') {
            buscarClienteExistente(value);
        }

        if (name === 'tipo_hospedaje') {
            console.log('🏠 Tipo de hospedaje seleccionado:', value);
            setFormData(prev => ({ ...prev, numero_hospedaje: '', cantidad_personas: 1 }));
            setHospedajesDisponibles([]);
            
            obtenerCantidadesDisponibles(value);
            
            const fechaEntrada = name === 'fecha_entrada' ? value : formData.fecha_entrada;
            const fechaSalida = name === 'fecha_salida' ? value : formData.fecha_salida;
            
            console.log('📅 Fechas actuales:', { fechaEntrada, fechaSalida });
            
            if (fechaEntrada && fechaSalida) {
                if (esFechaValida(fechaEntrada) && esFechaValida(fechaSalida)) {
                    // Solo verificar disponibilidad si no es camping ni grupos (que son ilimitados)
                    if (value !== '3' && value !== '4') {
                        console.log('✅ Fechas válidas, verificando disponibilidad...');
                        verificarDisponibilidadHospedajes(value, fechaEntrada, fechaSalida);
                    } else {
                        const tipoNombre = value === '3' ? 'Camping' : 'Grupos';
                        console.log(`✅ ${tipoNombre} seleccionado - no requiere verificación de disponibilidad (ilimitado)`);
                        setHospedajesDisponibles([]); // Limpiar hospedajes disponibles para camping/grupos
                    }
                    
                    // No calcular precio automáticamente al cambiar tipo de hospedaje
                    // El usuario debe seleccionar cantidad de personas primero
                    console.log('✅ Tipo de hospedaje seleccionado - esperando que el usuario seleccione cantidad de personas');
                } else {
                    console.log('❌ Fechas inválidas, no se puede verificar disponibilidad');
                }
            } else {
                console.log('⚠️ Fechas faltantes, no se puede verificar disponibilidad aún');
            }
        }
        
        if ((name === 'fecha_entrada' || name === 'fecha_salida') && formData.tipo_hospedaje) {
            const fechaEntrada = name === 'fecha_entrada' ? value : formData.fecha_entrada;
            const fechaSalida = name === 'fecha_salida' ? value : formData.fecha_salida;
            
            if (fechaEntrada && fechaSalida) {
                if (esFechaValida(fechaEntrada) && esFechaValida(fechaSalida)) {
                    // Solo verificar disponibilidad si no es camping ni grupos (que son ilimitados)
                    if (formData.tipo_hospedaje !== '3' && formData.tipo_hospedaje !== '4') {
                        verificarDisponibilidadHospedajes(formData.tipo_hospedaje, fechaEntrada, fechaSalida);
                    } else {
                        const tipoNombre = formData.tipo_hospedaje === '3' ? 'Camping' : 'Grupos';
                        console.log(`✅ ${tipoNombre} seleccionado - no requiere verificación de disponibilidad (ilimitado)`);
                        setHospedajesDisponibles([]); // Limpiar hospedajes disponibles para camping/grupos
                    }
                    
                    // Recalcular precio según el tipo de hospedaje solo si hay cantidad de personas seleccionada
                    if (formData.tipo_hospedaje === '3') {
                        // Para camping, usar función específica solo si hay cantidad de personas
                        if (formData.cantidad_personas && formData.cantidad_personas > 0) {
                            calcularPrecioCamping(fechaEntrada, fechaSalida, formData.metodo_pago);
                        } else {
                            console.log('✅ Camping seleccionado - esperando que el usuario seleccione cantidad de personas');
                        }
                    } else if (formData.tipo_hospedaje === '4') {
                        // Para grupos, no calcular precio automáticamente
                        console.log('✅ Grupos seleccionado - el administrador ingresa el monto manualmente');
                    } else if (formData.cantidad_personas && formData.cantidad_personas > 0) {
                        // Para otros tipos, usar función normal solo si hay cantidad de personas
                        calcularPrecioAutomatico(formData.tipo_hospedaje, formData.cantidad_personas, fechaEntrada, fechaSalida, formData.metodo_pago);
                    } else {
                        console.log('✅ Esperando que el usuario seleccione cantidad de personas para calcular precio');
                    }
                }
            }
        }
        
        if (name === 'cantidad_personas' && formData.tipo_hospedaje && formData.fecha_entrada && formData.fecha_salida) {
            if (value && esFechaValida(formData.fecha_entrada) && esFechaValida(formData.fecha_salida)) {
                // Solo calcular precio automáticamente si no es grupos (que se ingresa manualmente)
                if (formData.tipo_hospedaje !== '4') {
                    calcularPrecioAutomatico(formData.tipo_hospedaje, value, formData.fecha_entrada, formData.fecha_salida, formData.metodo_pago);
                } else {
                    console.log('✅ Grupos seleccionado - el administrador ingresa el monto manualmente');
                }
            }
        }
        
        // Si cambia el método de pago, recalcular precio automáticamente solo si hay cantidad de personas
        if (name === 'metodo_pago' && formData.tipo_hospedaje && formData.fecha_entrada && formData.fecha_salida) {
            if (value && esFechaValida(formData.fecha_entrada) && esFechaValida(formData.fecha_salida)) {
                if (formData.tipo_hospedaje === '3') {
                    // Para camping, usar función específica solo si hay cantidad de personas
                    if (formData.cantidad_personas && formData.cantidad_personas > 0) {
                        calcularPrecioCamping(formData.fecha_entrada, formData.fecha_salida, value);
                    } else {
                        console.log('✅ Método de pago cambiado - esperando cantidad de personas para calcular precio');
                    }
                } else if (formData.tipo_hospedaje === '4') {
                    // Para grupos, no calcular precio automáticamente
                    console.log('✅ Grupos seleccionado - el administrador ingresa el monto manualmente');
                } else if (formData.cantidad_personas && formData.cantidad_personas > 0) {
                    // Para otros tipos, usar función normal solo si hay cantidad de personas
                    calcularPrecioAutomatico(formData.tipo_hospedaje, formData.cantidad_personas, formData.fecha_entrada, formData.fecha_salida, value);
                } else {
                    console.log('✅ Método de pago cambiado - esperando cantidad de personas para calcular precio');
                }
            }
        }
        
        // Si cambia el descuento (seña), no afecta el monto total
        if (name === 'descuento') {
            const descuentoValue = parseFloat(value) || 0;
            // El monto_total ya tiene el descuento aplicado, la seña es un pago inicial
            const montoTotal = formData.monto_total || subtotal;
            
            // Limpiar timeout anterior si existe
            if (descuentoTimeoutRef.current) {
                clearTimeout(descuentoTimeoutRef.current);
            }
            
            // Crear nuevo timeout para mostrar notificación después de 1 segundo de inactividad
            descuentoTimeoutRef.current = setTimeout(() => {
                if (descuentoValue > 0) {
                    toast.info(`💸 Seña aplicada: $${descuentoValue}. Total: $${montoTotal}`);
                } else {
                    toast.info(`💰 Seña removida. Total: $${montoTotal}`);
                }
            }, 1000);
        }
        
        // Si cambia el tipo de descuento o valor de descuento, recalcular monto total
        if (name === 'tipo_descuento' || name === 'valor_descuento') {
            // Si se selecciona "Sin descuento", limpiar también el valor
            if (name === 'tipo_descuento' && !value) {
                setFormData(prev => ({
                    ...prev,
                    tipo_descuento: '',
                    valor_descuento: ''
                }));
                // Recalcular monto total sin descuento
                const baseParaDescuento = subtotal > 0 ? subtotal : (parseFloat(formData.monto_total) || 0);
                if (baseParaDescuento > 0) {
                    setFormData(prev => ({
                        ...prev,
                        monto_total: baseParaDescuento
                    }));
                }
                return;
            }
            
            // Para grupos, usar el monto_total actual como base si no hay subtotal calculado
            const baseParaDescuento = subtotal > 0 ? subtotal : (parseFloat(formData.monto_total) || 0);
            
            if (baseParaDescuento > 0 || formData.tipo_hospedaje === '4') {
                // Obtener valores actuales del descuento
                const tipoDescuentoActual = name === 'tipo_descuento' ? value : formData.tipo_descuento;
                const valorDescuentoActual = name === 'valor_descuento' ? value : formData.valor_descuento;
                
                const montoTotal = aplicarDescuento(baseParaDescuento, tipoDescuentoActual, valorDescuentoActual);
                setFormData(prev => ({
                    ...prev,
                    monto_total: montoTotal > 0 ? montoTotal : prev.monto_total
                }));
                
                // Actualizar subtotal si es para grupos y hay monto manual
                if (formData.tipo_hospedaje === '4' && baseParaDescuento > 0) {
                    setSubtotal(baseParaDescuento);
                }
                
                // Limpiar timeout anterior si existe
                if (descuentoTimeoutRef.current) {
                    clearTimeout(descuentoTimeoutRef.current);
                }
                
                // Crear nuevo timeout para mostrar notificación después de 1 segundo de inactividad
                descuentoTimeoutRef.current = setTimeout(() => {
                    if (tipoDescuentoActual && valorDescuentoActual && baseParaDescuento > 0) {
                        const descuentoAplicado = baseParaDescuento - montoTotal;
                        if (tipoDescuentoActual === 'porcentaje') {
                            toast.info(`🎯 Descuento aplicado: ${valorDescuentoActual}% ($${descuentoAplicado.toFixed(2)}). Total: $${montoTotal.toFixed(2)}`);
                        } else {
                            toast.info(`🎯 Descuento aplicado: $${valorDescuentoActual}. Total: $${montoTotal.toFixed(2)}`);
                        }
                    } else if (baseParaDescuento > 0) {
                        toast.info(`💰 Descuento removido. Total: $${baseParaDescuento.toFixed(2)}`);
                    }
                }, 1000);
            }
        }
        
        // Si cambia el monto_total manualmente (para grupos), actualizar subtotal y aplicar descuento si existe
        if (name === 'monto_total' && formData.tipo_hospedaje === '4') {
            const montoIngresado = parseFloat(value) || 0;
            if (montoIngresado >= 0) {
                // El monto ingresado es el subtotal base
                setSubtotal(montoIngresado);
                // Aplicar descuento si existe, sino usar el monto ingresado
                const montoTotal = aplicarDescuento(montoIngresado);
                setFormData(prev => ({
                    ...prev,
                    monto_total: montoTotal
                }));
            }
        }
    };

    // Función para manejar cambios en cantidad de adultos (camping)
    const handleCantidadAdultosChange = (e) => {
        const value = e.target.value;
        setCantidadAdultos(value);
        
        // Actualizar la cantidad total de personas
        const adultos = parseInt(value) || 0;
        const menores = parseInt(cantidadMenores) || 0;
        const totalPersonas = adultos + menores;
        setFormData(prev => ({
            ...prev,
            cantidad_personas: totalPersonas
        }));
        
        // Si es camping y tenemos fechas, recalcular precio con los valores actuales
        if (formData.tipo_hospedaje === '3' && formData.fecha_entrada && formData.fecha_salida) {
            if (esFechaValida(formData.fecha_entrada) && esFechaValida(formData.fecha_salida)) {
                calcularPrecioCamping(formData.fecha_entrada, formData.fecha_salida, formData.metodo_pago, value, cantidadMenores);
            }
        }
    };

    // Función para manejar cambios en cantidad de menores (camping)
    const handleCantidadMenoresChange = (e) => {
        const value = e.target.value;
        setCantidadMenores(value);
        
        // Actualizar la cantidad total de personas
        const adultos = parseInt(cantidadAdultos) || 0;
        const menores = parseInt(value) || 0;
        const totalPersonas = adultos + menores;
        setFormData(prev => ({
            ...prev,
            cantidad_personas: totalPersonas
        }));
        
        // Si es camping y tenemos fechas, recalcular precio con los valores actuales
        if (formData.tipo_hospedaje === '3' && formData.fecha_entrada && formData.fecha_salida) {
            if (esFechaValida(formData.fecha_entrada) && esFechaValida(formData.fecha_salida)) {
                calcularPrecioCamping(formData.fecha_entrada, formData.fecha_salida, formData.metodo_pago, cantidadAdultos, value);
            }
        }
    };

    // Función para obtener el nombre del tipo de hospedaje
    const getTipoHospedajeNombre = (tipoId) => {
        const tipo = tiposHospedaje.find(t => t.id == tipoId);
        return tipo ? tipo.nombre : 'Desconocido';
    };

    // Función para formatear el número de hospedaje
    const formatearNumeroHospedaje = (hospedaje) => {
        const tipoNombre = getTipoHospedajeNombre(hospedaje.tipo_hospedaje_id);
        
        switch (tipoNombre.toLowerCase()) {
            case 'cabaña':
                return `${hospedaje.numero} (Cap: ${hospedaje.capacidad})`;
            case 'dormis':
                return `${hospedaje.numero} (Cap: ${hospedaje.capacidad})`;
            case 'camping':
                return `Espacio ${hospedaje.numero} (Cap: ${hospedaje.capacidad})`;
            case 'grupos':
                return `Área ${hospedaje.numero} (Cap: ${hospedaje.capacidad})`;
            default:
                return `${hospedaje.numero} (Cap: ${hospedaje.capacidad})`;
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('🔍 Verificación final de disponibilidad antes de crear reserva...');
            
            const apiUrl = getApiUrl('hospedajes.php', `?disponibilidad=1&tipo_hospedaje_id=${formData.tipo_hospedaje}&fecha_entrada=${formData.fecha_entrada}&fecha_salida=${formData.fecha_salida}`);
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Error al verificar disponibilidad');
            }
            
            // Para camping y grupos no necesitamos verificar disponibilidad específica
            if (formData.tipo_hospedaje !== '3' && formData.tipo_hospedaje !== '4') {
                const hospedajeDisponible = data.hospedajes.find(h => h.id == formData.numero_hospedaje);
                
                if (!hospedajeDisponible) {
                    toast.error('❌ El hospedaje seleccionado ya no está disponible para las fechas elegidas. Por favor, selecciona otro hospedaje.');
                    setLoading(false);
                    return;
                }
                
                console.log('✅ Hospedaje confirmado como disponible:', hospedajeDisponible.numero);
            } else if (formData.tipo_hospedaje === '3') {
                console.log('✅ Camping seleccionado - no requiere verificación de disponibilidad específica');
            } else if (formData.tipo_hospedaje === '4') {
                console.log('✅ Grupos seleccionado - no requiere verificación de disponibilidad específica');
            }

            let clienteId;

            if (!clienteExistente) {
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
                
                clienteId = nuevoCliente.id;
                console.log('✅ Cliente ID obtenido:', clienteId);
            } else {
                clienteId = clienteExistente.id;
                console.log('✅ Usando cliente existente con ID:', clienteId);
            }

            const reservaData = {
                cliente_id: clienteId,
                hospedaje_id: (formData.tipo_hospedaje === '3' || formData.tipo_hospedaje === '4') ? null : formData.numero_hospedaje, // Para camping y grupos no hay hospedaje específico
                fecha_entrada: formData.fecha_entrada,
                fecha_salida: formData.fecha_salida,
                cantidad_personas: formData.cantidad_personas,
                monto_total: parseFloat(formData.monto_total),
                observaciones: formData.observaciones,
                estado: formData.estado,
                metodo_pago: formData.metodo_pago,
                descuento: formData.descuento || 0
            };

            console.log('🔄 Creando reserva con datos:', reservaData);
            console.log('🔍 Verificando cliente_id:', clienteId, 'tipo:', typeof clienteId);
            
            // Verificar que el cliente_id sea válido
            if (!clienteId || clienteId === 'undefined' || clienteId === 'null') {
                throw new Error('Error: El ID del cliente no es válido');
            }

            await handleCreateReserva(reservaData);
            
            limpiarFormulario();
            forceReload();
            
        } catch (error) {
            console.error('Error al crear reserva:', error);
            toast.error('Error al crear la reserva: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Cleanup del timeout cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (descuentoTimeoutRef.current) {
                clearTimeout(descuentoTimeoutRef.current);
            }
        };
    }, []);

    return {
        // Estados
        formData,
        tiposHospedaje,
        hospedajes,
        hospedajesDisponibles,
        loading,
        clienteExistente,
        verificandoDisponibilidad,
        calculandoPrecio,
        cantidadesDisponibles,
        subtotal,
        cantidadAdultos,
        cantidadMenores,
        cantidadNoches,
        
        // Funciones
        handleInputChange,
        handleSubmit,
        limpiarFormulario,
        getTipoHospedajeNombre,
        formatearNumeroHospedaje,
        handleCantidadAdultosChange,
        handleCantidadMenoresChange
    };
};
