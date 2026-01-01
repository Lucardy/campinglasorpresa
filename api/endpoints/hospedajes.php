<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/HospedajeController.php';

header('Content-Type: application/json');

try {
    error_log("Iniciando conexión a la base de datos...");
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    error_log("Conexión exitosa a la base de datos");

    error_log("Creando instancia del controlador...");
    $controller = new HospedajeController($pdo);
    error_log("Controlador creado exitosamente");

    error_log("Manejando la petición...");
    $controller->handleRequest();
    error_log("Petición manejada exitosamente");
} catch (PDOException $e) {
    error_log("Error de base de datos en hospedajes.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión a la base de datos',
        'details' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error en hospedajes.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'details' => $e->getMessage()
    ]);
} 