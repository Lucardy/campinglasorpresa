<?php
// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'campinglasorpresa');
define('DB_USER', 'root');
define('DB_PASS', '');

// Configuración de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Asegurarse de que el directorio de logs existe
if (!file_exists(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0777, true);
}

// Configuración de la aplicación
define('APP_NAME', 'Camping La Sorpresa');
define('APP_VERSION', '1.0.0');

// Configuración de la API
define('API_VERSION', '1.0.0');
define('API_URL', 'http://localhost/campinglasorpresa/api');

// Configuración de seguridad
define('JWT_SECRET', 'tu_clave_secreta_aqui');
define('JWT_EXPIRATION', 3600); // 1 hora

// Configuración de correo
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'tu_correo@gmail.com');
define('SMTP_PASS', 'tu_contraseña');

// Configuración de paginación
define('ITEMS_PER_PAGE', 10);

// Configuración de fechas
date_default_timezone_set('America/Argentina/Buenos_Aires'); 