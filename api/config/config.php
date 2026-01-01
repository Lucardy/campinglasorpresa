<?php
// Detectar si estamos en producción o desarrollo
$is_production = $_SERVER['HTTP_HOST'] === 'www.campinglasorpresa.com' || $_SERVER['HTTP_HOST'] === 'campinglasorpresa.com';

// Configuración de errores
if ($is_production) {
    // En producción: NO mostrar errores en pantalla, solo loguearlos
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ALL);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/error.log');
} else {
    // En desarrollo: mostrar errores para debugging
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/error.log');
}

// Asegurarse de que el directorio de logs existe
if (!file_exists(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0777, true);
}

// Log para debug
error_log("Host: " . $_SERVER['HTTP_HOST'] . " - Es producción: " . ($is_production ? 'SÍ' : 'NO'));

// Configuración de la base de datos
if ($is_production) {
    // Configuración para producción
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'u239851822_camping');
    define('DB_USER', 'u239851822_lucardy8');
    define('DB_PASS', '6Zm*=*L8#ej=');
    define('API_URL', 'https://campinglasorpresa.com/api');
} else {
    // Configuración para desarrollo local
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'campinglasorpresa');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('API_URL', 'http://localhost/campinglasorpresa/api');
}

// Configuración de la aplicación
define('APP_NAME', 'Camping La Sorpresa');
define('APP_VERSION', '1.0.0');

// Configuración de la API
define('API_VERSION', '1.0.0');

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

// Función para manejar errores de base de datos
function handleDatabaseError($e) {
    // Asegurar que siempre devolvemos JSON
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
    error_log("Error de base de datos: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión a la base de datos',
        'message' => 'No se pudo conectar a la base de datos'
    ]);
    exit;
} 