import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useAdmin from '../../hooks/useAdmin';
import config from '../../../../config';
import useHospedajes from '../../../../hooks/useHospedajes';
import { useReservaRapidaForm } from './useReservaRapidaForm';
import { useReservaRapidaCliente } from './useReservaRapidaCliente';
import { useReservaRapidaPrecios } from './useReservaRapidaPrecios';
import { useReservaRapidaDisponibilidad } from './useReservaRapidaDisponibilidad';

export const useReservaRapida = () => {
    const {
        clientes,
        fetchClientes,
        handleCreateCliente,
        handleCreateReserva,
        forceReload
    } = useAdmin();

    // Hook compartido para hospedajes
    const {
        tiposHospedaje,
        hospedajes,
        hospedajesDisponibles,
        loading: loadingHospedajes,
        fetchTiposHospedaje: fetchTiposHospedajeHook,
        fetchHospedajesDisponibles: fetchHospedajesDisponiblesHook,
        setHospedajesDisponibles
    } = useHospedajes();

    // Hook para manejo del formulario
    const {
        formData,
        setFormData,
        cantidadAdultos,
        cantidadMenores,
        cantidadNoches,
        limpiarFormulario: limpiarFormularioForm,
        handleCantidadAdultosChange,
        handleCantidadMenoresChange
    } = useReservaRapidaForm();

    // Hook para lógica de cliente
    const {
        clienteExistente,
        setClienteExistente,
        buscarClienteExistente,
        obtenerOcrearCliente
    } = useReservaRapidaCliente(clientes, handleCreateCliente, formData, setFormData);

    // Hook para cálculo de precios
    const {
        calculandoPrecio,
        subtotal,
        setSubtotal,
        aplicarDescuento,
        calcularPrecioCamping,
        calcularPrecioAutomatico,
        manejarCambioDescuento,
        manejarCambioTipoDescuento,
        manejarCambioMontoTotal
    } = useReservaRapidaPrecios(formData, setFormData, cantidadAdultos, cantidadMenores);

    // Hook para disponibilidad (pasa las funciones de useHospedajes para usar la misma instancia)
    const {
        verificandoDisponibilidad,
        cantidadesDisponibles,
        setCantidadesDisponibles,
        esFechaValida,
        obtenerCantidadesDisponibles,
        verificarDisponibilidadHospedajes
    } = useReservaRapidaDisponibilidad(fetchHospedajesDisponiblesHook, setHospedajesDisponibles);

    // Estados adicionales
    const [loading, setLoading] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        fetchClientes();
        fetchTiposHospedajeHook({ includeHospedajes: true });
    }, [fetchTiposHospedajeHook]);

    // Función para obtener la URL de la API según el entorno
    const getApiUrl = (endpoint, params = '') => {
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDev) {
            return `http://localhost/campinglasorpresa/api/endpoints/${endpoint}${params}`;
        } else {
            return `${config.API_URL}/${endpoint}${params}`;
        }
    };

    // Función para limpiar formulario (extendida)
    const limpiarFormulario = () => {
        limpiarFormularioForm();
        setClienteExistente(null);
        setCantidadesDisponibles([]);
        setSubtotal(0);
        setHospedajesDisponibles([]);
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
            // Limpiar hospedajes disponibles cuando cambia el tipo
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
                        setHospedajesDisponibles([]);
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
                        setHospedajesDisponibles([]);
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
                        calcularPrecioAutomatico(formData.tipo_hospedaje, formData.cantidad_personas, fechaEntrada, fechaSalida, formData.metodo_pago, esFechaValida);
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
                    calcularPrecioAutomatico(formData.tipo_hospedaje, value, formData.fecha_entrada, formData.fecha_salida, formData.metodo_pago, esFechaValida);
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
                    calcularPrecioAutomatico(formData.tipo_hospedaje, formData.cantidad_personas, formData.fecha_entrada, formData.fecha_salida, value, esFechaValida);
                } else {
                    console.log('✅ Método de pago cambiado - esperando cantidad de personas para calcular precio');
                }
            }
        }
        
        // Si cambia el descuento (seña), no afecta el monto total
        if (name === 'descuento') {
            manejarCambioDescuento(value);
        }
        
        // Si cambia el tipo de descuento o valor de descuento, recalcular monto total
        if (name === 'tipo_descuento' || name === 'valor_descuento') {
            manejarCambioTipoDescuento(name, value);
        }
        
        // Si cambia el monto_total manualmente (para grupos), actualizar subtotal y aplicar descuento si existe
        if (name === 'monto_total') {
            manejarCambioMontoTotal(value);
        }
    };

    // Función para manejar cambios en cantidad de adultos (camping) - extendida
    const handleCantidadAdultosChangeExtended = (e) => {
        const { adultos, menores } = handleCantidadAdultosChange(e);
        
        // Si es camping y tenemos fechas, recalcular precio con los valores actuales
        if (formData.tipo_hospedaje === '3' && formData.fecha_entrada && formData.fecha_salida) {
            if (esFechaValida(formData.fecha_entrada) && esFechaValida(formData.fecha_salida)) {
                calcularPrecioCamping(formData.fecha_entrada, formData.fecha_salida, formData.metodo_pago, adultos, menores);
            }
        }
    };

    // Función para manejar cambios en cantidad de menores (camping) - extendida
    const handleCantidadMenoresChangeExtended = (e) => {
        const { adultos, menores } = handleCantidadMenoresChange(e);
        
        // Si es camping y tenemos fechas, recalcular precio con los valores actuales
        if (formData.tipo_hospedaje === '3' && formData.fecha_entrada && formData.fecha_salida) {
            if (esFechaValida(formData.fecha_entrada) && esFechaValida(formData.fecha_salida)) {
                calcularPrecioCamping(formData.fecha_entrada, formData.fecha_salida, formData.metodo_pago, adultos, menores);
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

            // Obtener o crear cliente
            const clienteId = await obtenerOcrearCliente();

            const reservaData = {
                cliente_id: clienteId,
                hospedaje_id: (formData.tipo_hospedaje === '3' || formData.tipo_hospedaje === '4') ? null : formData.numero_hospedaje,
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
        handleCantidadAdultosChange: handleCantidadAdultosChangeExtended,
        handleCantidadMenoresChange: handleCantidadMenoresChangeExtended
    };
};
