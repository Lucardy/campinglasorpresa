<?php
// Test de configuración de base de datos
require_once 'api/config/config.php';

echo "<h1>Test de Configuración de Base de Datos</h1>";

echo "<h2>Información del Servidor:</h2>";
echo "<p><strong>HTTP_HOST:</strong> " . $_SERVER['HTTP_HOST'] . "</p>";
echo "<p><strong>SERVER_NAME:</strong> " . $_SERVER['SERVER_NAME'] . "</p>";

echo "<h2>Configuración Detectada:</h2>";
echo "<p><strong>Es Producción:</strong> " . ($is_production ? 'SÍ' : 'NO') . "</p>";

echo "<h2>Credenciales de Base de Datos:</h2>";
echo "<p><strong>DB_HOST:</strong> " . DB_HOST . "</p>";
echo "<p><strong>DB_NAME:</strong> " . DB_NAME . "</p>";
echo "<p><strong>DB_USER:</strong> " . DB_USER . "</p>";
echo "<p><strong>DB_PASS:</strong> " . (defined('DB_PASS') ? '***' : 'NO DEFINIDA') . "</p>";

echo "<h2>Test de Conexión:</h2>";
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    echo "<p style='color: green;'>✅ Conexión exitosa a la base de datos</p>";
    
    // Test de consulta
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM tipos_hospedaje");
    $result = $stmt->fetch();
    echo "<p style='color: green;'>✅ Consulta exitosa: " . $result['total'] . " tipos de hospedaje encontrados</p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Error de conexión: " . $e->getMessage() . "</p>";
}

echo "<h2>Logs de Error:</h2>";
$logFile = __DIR__ . '/api/logs/error.log';
if (file_exists($logFile)) {
    $logs = file_get_contents($logFile);
    echo "<pre>" . htmlspecialchars($logs) . "</pre>";
} else {
    echo "<p>No se encontró el archivo de logs</p>";
}
?>
