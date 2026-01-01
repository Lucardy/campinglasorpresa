/**
 * Utilidades para formatear datos
 */

/**
 * Formatea un precio a formato de moneda argentina
 * @param {number} precio - Precio a formatear
 * @returns {string} Precio formateado
 */
export const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(precio);
};

/**
 * Formatea una fecha a formato local argentino
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR');
};

