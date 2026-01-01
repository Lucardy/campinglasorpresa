<?php
require_once __DIR__ . '/../services/PagoService.php';

class PagoController {
    private $pagoService;

    public function __construct($pdo) {
        $this->pagoService = new PagoService($pdo);
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
                'success' => false,
                'error' => true,
                'message' => $e->getMessage()
            ]);
        }
    }

    private function handleGet() {
        if (isset($_GET['reserva_id'])) {
            $pagos = $this->pagoService->obtenerPagosPorReserva($_GET['reserva_id']);
            $totalPagado = $this->pagoService->getTotalPagado($_GET['reserva_id']);
            
            echo json_encode([
                'success' => true,
                'pagos' => $pagos,
                'total_pagado' => $totalPagado
            ]);
            return;
        }

        if (isset($_GET['id'])) {
            $pago = $this->pagoService->obtenerPago($_GET['id']);
            echo json_encode([
                'success' => true,
                'pago' => $pago
            ]);
            return;
        }

        throw new Exception('Se requiere reserva_id o id');
    }

    private function handlePost() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('Datos inválidos');
        }

        $pagoId = $this->pagoService->crearPago($data);
        
        echo json_encode([
            'success' => true,
            'id' => $pagoId,
            'message' => 'Pago creado exitosamente'
        ]);
    }

    private function handlePut() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['id'])) {
            throw new Exception('ID de pago no proporcionado');
        }

        $this->pagoService->actualizarPago($data['id'], $data);
        echo json_encode([
            'success' => true,
            'message' => 'Pago actualizado exitosamente'
        ]);
    }

    private function handleDelete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            throw new Exception('ID de pago no proporcionado');
        }

        $this->pagoService->eliminarPago($id);
        echo json_encode([
            'success' => true,
            'message' => 'Pago eliminado exitosamente'
        ]);
    }
}

