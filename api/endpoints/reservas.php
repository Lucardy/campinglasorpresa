<?php
// Establecer headers primero, antes de cualquier salida o require
header('Content-Type: application/json; charset=utf-8');

// Prevenir que errores de PHP se muestren como HTML
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/ReservaController.php';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
        ]
    );

    $controller = new ReservaController($pdo);
    $controller->handleRequest();
} catch (PDOException $e) {
    // Asegurar que siempre devolvemos JSON, incluso en errores
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
    handleDatabaseError($e);
} catch (Exception $e) {
    // Asegurar que siempre devolvemos JSON, incluso en errores
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
    error_log("Error en reservas.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'message' => 'Error al procesar la solicitud'
    ]);
    exit;
} 