/**
 * Utilidades para el manejo correcto de fechas
 * Soluciona problemas de zona horaria al mostrar fechas
 */

/**
 * Convierte una fecha string (YYYY-MM-DD) a un objeto Date local
 * Evita problemas de zona horaria al interpretar fechas
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} - Objeto Date en zona horaria local
 */
export const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    
    // Si ya es un objeto Date, devolverlo
    if (dateString instanceof Date) return dateString;
    
    // Para fechas en formato YYYY-MM-DD, crear la fecha en zona horaria local
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month es 0-indexado en Date
};

/**
 * Formatea una fecha para mostrar en la interfaz
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, options = {}) => {
    if (!date) return 'No disponible';
    
    const dateObj = parseLocalDate(date);
    if (!dateObj) return 'Fecha inválida';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };
    
    return dateObj.toLocaleDateString('es-AR', defaultOptions);
};

/**
 * Formatea una fecha con hora para mostrar en la interfaz
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (date, options = {}) => {
    if (!date) return 'No disponible';
    
    const dateObj = parseLocalDate(date);
    if (!dateObj) return 'Fecha inválida';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };
    
    return dateObj.toLocaleDateString('es-AR', defaultOptions);
};

/**
 * Formatea una fecha para el calendario (solo fecha, sin hora)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada para calendario
 */
export const formatDateForCalendar = (date) => {
    if (!date) return 'No disponible';
    
    const dateObj = parseLocalDate(date);
    if (!dateObj) return 'Fecha inválida';
    
    return dateObj.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Convierte una fecha a formato YYYY-MM-DD para inputs de tipo date
 * @param {string|Date} date - Fecha a convertir
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
    if (!date) return '';
    
    const dateObj = parseLocalDate(date);
    if (!dateObj) return '';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para inputs de tipo date
 * @returns {string} - Fecha actual en formato YYYY-MM-DD
 */
export const getTodayForInput = () => {
    const today = new Date();
    return formatDateForInput(today);
};

/**
 * Calcula el número de noches entre dos fechas
 * @param {string|Date} fechaEntrada - Fecha de entrada
 * @param {string|Date} fechaSalida - Fecha de salida
 * @returns {number} - Número de noches
 */
export const calcularNoches = (fechaEntrada, fechaSalida) => {
    if (!fechaEntrada || !fechaSalida) return 0;
    
    const entrada = parseLocalDate(fechaEntrada);
    const salida = parseLocalDate(fechaSalida);
    
    if (!entrada || !salida) return 0;
    
    // Calcular la diferencia en milisegundos
    const diferenciaMs = salida.getTime() - entrada.getTime();
    
    // Convertir a días (1 día = 24 * 60 * 60 * 1000 ms)
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    
    // El número de noches es igual a los días de diferencia
    return Math.max(0, diferenciaDias);
};