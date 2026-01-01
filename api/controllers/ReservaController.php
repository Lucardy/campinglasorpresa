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
                'success' => false,
                'error' => true,
                'message' => $e->getMessage()
            ]);
        }
    }

    private function handleGet() {
        // Buscar reservas por cliente (debe ir primero para evitar conflictos)
        if (isset($_GET['cliente_id'])) {
            $reservas = $this->reservaService->buscarReservasPorCliente($_GET['cliente_id']);
            echo json_encode($reservas);
            return;
        }

        // Reportes de ingresos
        if (isset($_GET['reportes_ingresos'])) {
            try {
                $filtros = [
                    'fecha_inicio' => $_GET['fecha_inicio'] ?? null,
                    'fecha_fin' => $_GET['fecha_fin'] ?? null,
                    'metodo_pago' => $_GET['metodo_pago'] ?? null,
                    'tipo_hospedaje' => $_GET['tipo_hospedaje'] ?? null
                ];
                
                $reportes = $this->reservaService->getReportesIngresos($filtros);
                echo json_encode([
                    'success' => true,
                    'reportes' => $reportes['reportes'],
                    'estadisticas' => $reportes['estadisticas'],
                    'reportesPorReserva' => $reportes['reportesPorReserva'] ?? [],
                    'estadisticasPorReserva' => $reportes['estadisticasPorReserva'] ?? []
                ]);
                return;
            } catch (Exception $e) {
                error_log('Error en reportes de ingresos: ' . $e->getMessage());
                echo json_encode([
                    'success' => false,
                    'error' => 'Error al obtener reportes de ingresos: ' . $e->getMessage()
                ]);
                return;
            }
        }

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
        try {
            // Log para debugging del body raw
            $rawInput = file_get_contents('php://input');
            error_log("Raw input recibido: " . $rawInput);
            error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'no definido'));
            error_log("Content-Length: " . ($_SERVER['CONTENT_LENGTH'] ?? 'no definido'));
            error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
            error_log("HTTP Content-Length: " . ($_SERVER['HTTP_CONTENT_LENGTH'] ?? 'no definido'));
            
            // Verificar si hay datos en $_POST (por si acaso)
            error_log("POST data: " . json_encode($_POST));
            
            if (empty($rawInput)) {
                error_log("ERROR: Raw input está vacío");
                throw new Exception('No se recibieron datos en la petición');
            }
            
            $data = json_decode($rawInput, true);
            
            if (!$data) {
                error_log("Error al decodificar JSON: " . json_last_error_msg());
                throw new Exception('Datos inválidos - Error al decodificar JSON: ' . json_last_error_msg());
            }

            // Log para debugging
            error_log("Datos recibidos en handlePost: " . json_encode($data));

            $reservaId = $this->reservaService->crearReserva($data);
            
            // Log para debugging
            error_log("Reserva creada con ID: " . $reservaId);
            
            $response = [
                'success' => true,
                'id' => $reservaId,
                'message' => 'Reserva creada exitosamente'
            ];
            
            error_log("Respuesta a enviar: " . json_encode($response));
            echo json_encode($response);
            
        } catch (Exception $e) {
            error_log("Error en handlePost: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => true,
                'message' => $e->getMessage()
            ]);
        }
    }

    private function handlePut() {
        try {
            $rawInput = file_get_contents('php://input');
            error_log("PUT - Raw input recibido: " . $rawInput);
            
            $data = json_decode($rawInput, true);
            
            if (!$data) {
                error_log("PUT - Error al decodificar JSON: " . json_last_error_msg());
                throw new Exception('Datos inválidos - Error al decodificar JSON: ' . json_last_error_msg());
            }
            
            error_log("PUT - Datos recibidos: " . json_encode($data));
            
            if (!isset($data['id'])) {
                throw new Exception('ID de reserva no proporcionado');
            }

            $this->reservaService->actualizarReserva($data['id'], $data);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Error en handlePut: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e; // Re-lanzar para que lo capture handleRequest
        }
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