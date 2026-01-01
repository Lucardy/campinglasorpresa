/**
 * Utilidades para cálculos relacionados con reservas y reportes
 */

/**
 * Calcula el número de noches entre dos fechas
 * @param {string|Date} desde - Fecha de inicio
 * @param {string|Date} hastaExclusiva - Fecha de fin (exclusiva)
 * @returns {number} Número de noches
 */
export const calcularNoches = (desde, hastaExclusiva) => {
    const d1 = new Date(desde);
    const d2 = new Date(hastaExclusiva);
    return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
};

/**
 * Calcula el monto proporcional de una reserva dentro de un rango de fechas
 * @param {Object} reserva - Objeto de reserva con fecha_entrada, fecha_salida, monto_total
 * @param {string} rangoInicio - Fecha de inicio del rango
 * @param {string} rangoFin - Fecha de fin del rango
 * @returns {number} Monto proporcional
 */
export const calcularProporcionalReserva = (reserva, rangoInicio, rangoFin) => {
    if (!rangoInicio && !rangoFin) return 0;
    const entrada = new Date(reserva.fecha_entrada);
    const salidaExclusiva = new Date(reserva.fecha_salida);

    const rInicio = rangoInicio ? new Date(rangoInicio) : entrada;
    // rango fin EXCLUSIVO: usar tal cual la fecha fin seleccionada
    const rFinExcl = rangoFin ? new Date(rangoFin) : salidaExclusiva;

    // ajustar a solapamiento efectivo
    const calcInicio = new Date(Math.max(entrada.getTime(), rInicio.getTime()));
    const calcFinExcl = new Date(Math.min(salidaExclusiva.getTime(), rFinExcl.getTime()));

    if (calcFinExcl <= calcInicio) return 0;

    const nochesTotales = calcularNoches(entrada, salidaExclusiva);
    if (nochesTotales <= 0) return 0;
    const nochesEnRango = calcularNoches(calcInicio, calcFinExcl);
    const montoPorNoche = (Number(reserva.monto_total) || 0) / nochesTotales;
    return montoPorNoche * nochesEnRango;
};

/**
 * Calcula el total proporcional de una lista de reservas
 * @param {Array} lista - Lista de reservas
 * @param {string} inicio - Fecha de inicio del rango
 * @param {string} fin - Fecha de fin del rango
 * @returns {number} Total proporcional
 */
export const calcularTotalProporcional = (lista, inicio, fin) => {
    return (lista || []).reduce((acc, r) => acc + calcularProporcionalReserva(r, inicio, fin), 0);
};

