<?php
require_once __DIR__ . '/../services/ClienteService.php';

class ClienteController {
    private $clienteService;

    public function __construct($pdo) {
        $this->clienteService = new ClienteService($pdo);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        try {
            switch ($method) {
                case 'GET':
                    $this->handleGet();
                    break;
                case 'POST':
                    $this->handlePost();
                    break;
                case 'PUT':
                    $this->handlePut();
                    break;
                case 'DELETE':
                    $this->handleDelete();
                    break;
                default:
                    throw new Exception('Método no permitido');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => true,
                'message' => $e->getMessage()
            ]);
        }
    }

    private function handleGet() {
        error_log("🔍 ClienteController: GET request recibido");
        error_log("🔍 Parámetros GET: " . json_encode($_GET));
        
        if (isset($_GET['search'])) {
            error_log("🔍 Búsqueda de clientes con término: " . $_GET['search']);
            $clientes = $this->clienteService->buscarClientes($_GET['search']);
            error_log("🔍 Clientes encontrados: " . count($clientes));
            echo json_encode($clientes);
            return;
        }

        if (isset($_GET['id'])) {
            error_log("🔍 Obteniendo cliente con ID: " . $_GET['id']);
            $cliente = $this->clienteService->obtenerCliente($_GET['id']);
            echo json_encode($cliente);
            return;
        }

        error_log("🔍 Obteniendo todos los clientes");
        $clientes = $this->clienteService->buscarClientes();
        error_log("🔍 Total de clientes: " . count($clientes));
        echo json_encode($clientes);
    }

    private function handlePost() {
        error_log("🔄 ClienteController: POST request recibido");
        $data = json_decode(file_get_contents('php://input'), true);
        error_log("📝 Datos recibidos: " . json_encode($data));
        
        if (!$data) {
            error_log("❌ Datos inválidos recibidos");
            throw new Exception('Datos inválidos');
        }

        $clienteId = $this->clienteService->crearCliente($data);
        error_log("✅ Cliente creado con ID: " . $clienteId);
        echo json_encode(['id' => $clienteId]);
    }

    private function handlePut() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Obtener el ID de la URL o de los datos
        $id = $_GET['id'] ?? $data['id'] ?? null;
        
        if (!$id) {
            throw new Exception('ID de cliente no proporcionado');
        }

        $this->clienteService->actualizarCliente($id, $data);
        echo json_encode(['success' => true]);
    }

    private function handleDelete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            throw new Exception('ID de cliente no proporcionado');
        }

        $this->clienteService->eliminarCliente($id);
        echo json_encode(['success' => true]);
    }
} 