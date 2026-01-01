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
        if (isset($_GET['search'])) {
            $clientes = $this->clienteService->buscarClientes($_GET['search']);
            echo json_encode($clientes);
            return;
        }

        if (isset($_GET['id'])) {
            $cliente = $this->clienteService->obtenerCliente($_GET['id']);
            echo json_encode($cliente);
            return;
        }

        $clientes = $this->clienteService->buscarClientes();
        echo json_encode($clientes);
    }

    private function handlePost() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('Datos inválidos');
        }

        $clienteId = $this->clienteService->crearCliente($data);
        echo json_encode(['id' => $clienteId]);
    }

    private function handlePut() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('ID de cliente no proporcionado');
        }

        $this->clienteService->actualizarCliente($data['id'], $data);
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