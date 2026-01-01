<?php
// Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Origin: *');

// Permitir métodos HTTP específicos
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Permitir encabezados específicos
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma');

// Permitir credenciales
header('Access-Control-Allow-Credentials: true');

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
} 