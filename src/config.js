const config = {
    // URLs de la API
    API_URL: import.meta.env.VITE_API_URL || 'https://www.campinglasorpresa.com/api/endpoints',
    BASE_URL: import.meta.env.VITE_BASE_URL || 'https://www.campinglasorpresa.com',
    
    // Configuración de la aplicación
    APP_NAME: 'Camping La Sorpresa',
    APP_VERSION: '1.0.0',
    
    // Configuración de fechas
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH:mm',
    
    // Configuración de paginación
    ITEMS_PER_PAGE: 10,
    
    // Configuración de moneda
    CURRENCY: 'ARS',
    CURRENCY_SYMBOL: '$',
    
    // Configuración de roles
    ROLES: {
        ADMIN: 'admin',
        USER: 'user'
    },
    
    // Configuración de estados de reserva
    RESERVA_ESTADOS: {
        ACTIVA: 'activa',
        CANCELADA: 'cancelada',
        COMPLETADA: 'completada'
    }
};

export default config; 