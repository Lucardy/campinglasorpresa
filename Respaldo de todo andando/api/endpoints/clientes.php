<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../controllers/ClienteController.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $controller = new ClienteController($pdo);
    $controller->handleRequest();
} catch (Exception $e) {
    error_log("Error en clientes.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => $e->getMessage()]);
} 