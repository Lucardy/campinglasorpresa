import config from '../config';

/**
 * Servicio centralizado para todas las operaciones de cálculo de precios
 * Elimina duplicación de código entre useReservaRapida y EditarReservaModal
 */
class PrecioService {
    /**
     * Construye la URL completa de la API
     * @param {string} endpoint - Endpoint de la API
     * @param {string} params - Parámetros de consulta
     * @returns {string} URL completa
     */
    buildUrl(endpoint, params = '') {
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDev) {
            return `http://localhost/campinglasorpresa/api/endpoints/${endpoint}${params}`;
        } else {
            return `${config.API_URL}/${endpoint}${params}`;
        }
    }

    /**
     * Calcula el número de días entre dos fechas
     * @param {string} fechaEntrada - Fecha de entrada (YYYY-MM-DD)
     * @param {string} fechaSalida - Fecha de salida (YYYY-MM-DD)
     * @returns {number} Número de días
     */
    calcularDias(fechaEntrada, fechaSalida) {
        const fechaEntradaObj = new Date(fechaEntrada);
        const fechaSalidaObj = new Date(fechaSalida);
        const diffTime = Math.abs(fechaSalidaObj - fechaEntradaObj);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Calcula el precio para camping
     * @param {string} fechaEntrada - Fecha de entrada (YYYY-MM-DD)
     * @param {string} fechaSalida - Fecha de salida (YYYY-MM-DD)
     * @param {string} metodoPago - Método de pago ('efectivo', 'transferencia', etc.)
     * @param {number} adultos - Cantidad de adultos
     * @param {number} menores - Cantidad de menores
     * @returns {Promise<Object>} Objeto con precioBase, precioAdulto, precioMenor, precioPorDia, subtotal, cantidadDias
     */
    async calcularPrecioCamping(fechaEntrada, fechaSalida, metodoPago = 'efectivo', adultos = 0, menores = 0) {
        try {
            console.log('🏕️ PrecioService: Calculando precio camping...', { fechaEntrada, fechaSalida, metodoPago, adultos, menores });
            
            const apiUrl = this.buildUrl('hospedajes.php', `?precios_camping&metodo_pago=${metodoPago}`);
            console.log('🔗 URL de la API camping:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            if (!data.success || !data.precios) {
                throw new Error(data.error || 'Error al obtener precios de camping');
            }
            
            const precios = data.precios;
            const precioBase = parseFloat(precios.base) || 0;
            const precioAdulto = parseFloat(precios.adulto) || 0;
            const precioMenor = parseFloat(precios.menor) || 0;
            
            const cantidadDias = this.calcularDias(fechaEntrada, fechaSalida);
            const precioAdultos = adultos * precioAdulto;
            const precioMenores = menores * precioMenor;
            const precioPorDia = precioBase + precioAdultos + precioMenores;
            const subtotal = precioPorDia * cantidadDias;
            
            console.log('✅ PrecioService: Precio camping calculado', {
                precioBase,
                precioAdulto,
                precioMenor,
                precioPorDia,
                cantidadDias,
                subtotal
            });
            
            return {
                precioBase,
                precioAdulto,
                precioMenor,
                precioPorDia,
                cantidadDias,
                subtotal,
                adultos,
                menores
            };
        } catch (error) {
            console.error('❌ PrecioService: Error al calcular precio camping:', error);
            throw error;
        }
    }

    /**
     * Calcula el precio automático para otros tipos de hospedaje
     * @param {string|number} tipoHospedajeId - ID del tipo de hospedaje
     * @param {number} cantidadPersonas - Cantidad de personas
     * @param {string} fechaEntrada - Fecha de entrada (YYYY-MM-DD)
     * @param {string} fechaSalida - Fecha de salida (YYYY-MM-DD)
     * @param {string} metodoPago - Método de pago ('efectivo', 'transferencia', etc.)
     * @returns {Promise<Object>} Objeto con precioPorDia, subtotal, cantidadDias
     */
    async calcularPrecioAutomatico(tipoHospedajeId, cantidadPersonas, fechaEntrada, fechaSalida, metodoPago = 'efectivo') {
        try {
            console.log('💰 PrecioService: Calculando precio automático...', {
                tipoHospedajeId,
                cantidadPersonas,
                fechaEntrada,
                fechaSalida,
                metodoPago
            });
            
            const apiUrl = this.buildUrl('hospedajes.php', `?precio&tipo_hospedaje_id=${tipoHospedajeId}&cantidad_personas=${cantidadPersonas}&metodo_pago=${metodoPago}`);
            console.log('🔗 URL de la API precio:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            if (!data.success || !data.precio) {
                throw new Error(data.error || 'Error al obtener precio');
            }
            
            const precioPorDia = parseFloat(data.precio);
            const cantidadDias = this.calcularDias(fechaEntrada, fechaSalida);
            const subtotal = precioPorDia * cantidadDias;
            
            console.log('✅ PrecioService: Precio automático calculado', {
                precioPorDia,
                cantidadDias,
                subtotal
            });
            
            return {
                precioPorDia,
                cantidadDias,
                subtotal
            };
        } catch (error) {
            console.error('❌ PrecioService: Error al calcular precio automático:', error);
            throw error;
        }
    }

    /**
     * Aplica un descuento a un monto
     * @param {number} subtotal - Monto base
     * @param {string} tipoDescuento - Tipo de descuento ('monto' o 'porcentaje')
     * @param {number} valorDescuento - Valor del descuento
     * @returns {number} Monto con descuento aplicado
     */
    calcularDescuento(subtotal, tipoDescuento, valorDescuento) {
        if (!tipoDescuento || !valorDescuento) {
            return subtotal;
        }
        
        const valorNum = parseFloat(valorDescuento) || 0;
        if (valorNum <= 0) {
            return subtotal;
        }
        
        let montoDescuento = 0;
        if (tipoDescuento === 'porcentaje') {
            // Aplicar descuento porcentual
            montoDescuento = (subtotal * valorNum) / 100;
        } else if (tipoDescuento === 'monto') {
            // Aplicar descuento fijo
            montoDescuento = valorNum;
        }
        
        // Asegurar que el descuento no sea mayor que el subtotal
        montoDescuento = Math.min(montoDescuento, subtotal);
        
        return Math.max(0, subtotal - montoDescuento);
    }

    /**
     * Recalcula el precio con descuento aplicado
     * @param {number} precioBase - Precio base (subtotal)
     * @param {number} descuento - Valor del descuento (seña)
     * @returns {number} Precio final
     */
    recalcularPrecioConDescuento(precioBase, descuento = 0) {
        // El monto_total debe ser el subtotal completo, sin restar la seña
        // La seña se registrará como un pago inicial
        return precioBase;
    }

    /**
     * Formatea un precio como moneda
     * @param {number} monto - Monto a formatear
     * @returns {string} Monto formateado
     */
    formatearPrecio(monto) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    }
}

// Exportar una instancia única del servicio (Singleton)
const precioService = new PrecioService();
export default precioService;

