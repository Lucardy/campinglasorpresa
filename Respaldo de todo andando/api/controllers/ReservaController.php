<?php
require_once __DIR__ . '/../services/ReservaService.php';

class ReservaController {
    private $reservaService;

    public function __construct($pdo) {
        $this->reservaService = new ReservaService($pdo);
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
            $reservas = $this->reservaService->buscarReservas($_GET['search']);
            echo json_encode($reservas);
            return;
        }

        if (isset($_GET['id'])) {
            $reserva = $this->reservaService->obtenerReserva($_GET['id']);
            echo json_encode($reserva);
            return;
        }

        $reservas = $this->reservaService->buscarReservas();
        echo json_encode($reservas);
    }

    private function handlePost() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('Datos inválidos');
        }

        $reservaId = $this->reservaService->crearReserva($data);
        echo json_encode(['id' => $reservaId]);
    }

    private function handlePut() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('ID de reserva no proporcionado');
        }

        $this->reservaService->actualizarReserva($data['id'], $data);
        echo json_encode(['success' => true]);
    }

    private function handleDelete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            throw new Exception('ID de reserva no proporcionado');
        }

        $this->reservaService->eliminarReserva($id);
        echo json_encode(['success' => true]);
    }
} 