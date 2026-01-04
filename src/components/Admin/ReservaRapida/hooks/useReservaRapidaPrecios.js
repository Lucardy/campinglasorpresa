import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import precioService from '../../../../services/precioService';

/**
 * Hook para manejar el cálculo de precios y descuentos
 */
export const useReservaRapidaPrecios = (formData, setFormData, cantidadAdultos, cantidadMenores) => {
    const [calculandoPrecio, setCalculandoPrecio] = useState(false);
    const [subtotal, setSubtotal] = useState(0);
    const descuentoTimeoutRef = useRef(null);

    // Cleanup del timeout cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (descuentoTimeoutRef.current) {
                clearTimeout(descuentoTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Aplica un descuento a un monto
     */
    const aplicarDescuento = (subtotal, tipoDescuento = null, valorDescuento = null) => {
        const tipo = tipoDescuento !== null ? tipoDescuento : formData.tipo_descuento;
        const valor = valorDescuento !== null ? valorDescuento : formData.valor_descuento;
        return precioService.calcularDescuento(subtotal, tipo, valor);
    };

    /**
     * Calcula el precio para camping
     */
    const calcularPrecioCamping = async (fechaEntrada, fechaSalida, metodoPago = 'efectivo', adultosActuales = null, menoresActuales = null) => {
        try {
            setCalculandoPrecio(true);
            
            const adultos = adultosActuales !== null ? parseInt(adultosActuales) || 0 : (parseInt(cantidadAdultos) || 0);
            const menores = menoresActuales !== null ? parseInt(menoresActuales) || 0 : (parseInt(cantidadMenores) || 0);
            
            const resultado = await precioService.calcularPrecioCamping(
                fechaEntrada,
                fechaSalida,
                metodoPago,
                adultos,
                menores
            );
            
            const descuentoValue = parseFloat(formData.descuento) || 0;
            const montoTotal = aplicarDescuento(resultado.subtotal);
            
            setSubtotal(resultado.subtotal);
            setFormData(prev => ({
                ...prev,
                monto_total: montoTotal
            }));
            
            if (descuentoValue > 0) {
                toast.success(`🏕️ Precio camping calculado: $${montoTotal} (Seña: $${descuentoValue}, Falta pagar: $${montoTotal - descuentoValue})`);
            } else {
                toast.success(`🏕️ Precio camping calculado: $${montoTotal} (${resultado.cantidadDias} días × $${resultado.precioPorDia})`);
            }
        } catch (error) {
            console.error('❌ Error al calcular precio camping:', error);
            toast.error(`Error al calcular precio camping: ${error.message}`);
        } finally {
            setCalculandoPrecio(false);
        }
    };

    /**
     * Calcula el precio automático para otros tipos de hospedaje
     */
    const calcularPrecioAutomatico = async (tipoHospedajeId, cantidadPersonas, fechaEntrada, fechaSalida, metodoPago = 'efectivo', esFechaValida) => {
        try {
            if (!tipoHospedajeId || !cantidadPersonas || !fechaEntrada || !fechaSalida) {
                return;
            }

            if (esFechaValida && (!esFechaValida(fechaEntrada) || !esFechaValida(fechaSalida))) {
                return;
            }

            setCalculandoPrecio(true);
            
            const resultado = await precioService.calcularPrecioAutomatico(
                tipoHospedajeId,
                cantidadPersonas,
                fechaEntrada,
                fechaSalida,
                metodoPago
            );
            
            const descuentoValue = parseFloat(formData.descuento) || 0;
            const montoTotal = aplicarDescuento(resultado.subtotal);
            
            setSubtotal(resultado.subtotal);
            setFormData(prev => ({
                ...prev,
                monto_total: montoTotal
            }));
            
            if (descuentoValue > 0) {
                toast.success(`💰 Precio calculado: $${montoTotal} (Seña: $${descuentoValue}, Falta pagar: $${montoTotal - descuentoValue})`);
            } else {
                toast.success(`💰 Precio calculado: $${montoTotal} (${resultado.cantidadDias} días × $${resultado.precioPorDia})`);
            }
        } catch (error) {
            console.error('❌ Error al calcular precio:', error);
            toast.error(`Error al calcular precio: ${error.message}`);
        } finally {
            setCalculandoPrecio(false);
        }
    };

    /**
     * Maneja cambios en el descuento con debounce
     */
    const manejarCambioDescuento = (value) => {
        const descuentoValue = parseFloat(value) || 0;
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
    };

    /**
     * Maneja cambios en tipo de descuento o valor de descuento
     */
    const manejarCambioTipoDescuento = (name, value) => {
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
    };

    /**
     * Maneja cambios en monto_total manual (para grupos)
     */
    const manejarCambioMontoTotal = (value) => {
        if (formData.tipo_hospedaje === '4') {
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

    return {
        calculandoPrecio,
        subtotal,
        setSubtotal,
        aplicarDescuento,
        calcularPrecioCamping,
        calcularPrecioAutomatico,
        manejarCambioDescuento,
        manejarCambioTipoDescuento,
        manejarCambioMontoTotal
    };
};

