<?php
require_once __DIR__ . '/../services/HospedajeService.php';

class HospedajeController {
    private $hospedajeService;

    public function __construct($pdo) {
        $this->hospedajeService = new HospedajeService($pdo);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        try {
            switch ($method) {
                case 'GET':
                    $this->handleGet($_GET);
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
            error_log("Error en HospedajeController::handleRequest: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => true,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function handleGet($params = []) {
        try {
            error_log("Parámetros recibidos: " . json_encode($params));
            
            // Obtener cantidades de personas disponibles
            if (isset($params['cantidades_personas'])) {
                if (!isset($params['tipo_hospedaje_id'])) {
                    throw new Exception('Se requiere el tipo de hospedaje');
                }

                $cantidades = $this->hospedajeService->getCantidadesPersonasDisponibles($params['tipo_hospedaje_id']);
                echo json_encode([
                    'success' => true,
                    'cantidades' => $cantidades
                ]);
                return;
            }

            // Obtener precio por tipo de hospedaje y cantidad de personas
            if (isset($params['precio'])) {
                if (!isset($params['tipo_hospedaje_id']) || !isset($params['cantidad_personas'])) {
                    throw new Exception('Se requieren el tipo de hospedaje y la cantidad de personas');
                }

                $precio = $this->hospedajeService->getPrecioHospedaje(
                    $params['tipo_hospedaje_id'],
                    $params['cantidad_personas']
                );

                echo json_encode([
                    'success' => true,
                    'precio' => $precio
                ]);
                return;
            }

            // Obtener todos los precios
            if (isset($params['precios'])) {
                $precios = $this->hospedajeService->getAllPrecios();
                echo json_encode([
                    'success' => true,
                    'precios' => $precios
                ]);
                return;
            }

            // Obtener tipos de hospedaje
            if (isset($params['tipos'])) {
                $tipos = $this->hospedajeService->obtenerTiposHospedaje();
                echo json_encode([
                    'success' => true,
                    'tipos' => $tipos
                ]);
                return;
            }

            // Verificar disponibilidad
            if (isset($params['disponibilidad']) && isset($params['id'])) {
                if (!is_numeric($params['id'])) {
                    throw new Exception('ID de hospedaje inválido');
                }

                if (!isset($params['fecha_entrada']) || !isset($params['fecha_salida'])) {
                    throw new Exception('Las fechas son requeridas para verificar disponibilidad');
                }

                error_log("Verificando disponibilidad para hospedaje: " . $params['id']);
                $disponible = $this->hospedajeService->verificarDisponibilidad(
                    $params['id'],
                    $params['fecha_entrada'],
                    $params['fecha_salida']
                );

                echo json_encode([
                    'success' => true,
                    'disponible' => $disponible,
                    'mensaje' => $disponible ? 'Hospedaje disponible' : 'El hospedaje ya está reservado para las fechas seleccionadas'
                ]);
                return;
            }

            // Obtener hospedajes disponibles
            if (isset($params['tipo_hospedaje_id'])) {
                if (!is_numeric($params['tipo_hospedaje_id'])) {
                    throw new Exception('ID de tipo de hospedaje inválido');
                }

                if (!isset($params['fecha_entrada']) || !isset($params['fecha_salida'])) {
                    throw new Exception('Las fechas son requeridas');
                }

                error_log("Fechas recibidas - Entrada: " . $params['fecha_entrada'] . ", Salida: " . $params['fecha_salida']);

                $hospedajes = $this->hospedajeService->obtenerHospedajesDisponibles(
                    $params['fecha_entrada'],
                    $params['fecha_salida'],
                    $params['tipo_hospedaje_id']
                );

                echo json_encode([
                    'success' => true,
                    'hospedajes' => $hospedajes
                ]);
                return;
            }

            // Obtener todos los hospedajes
            $hospedajes = $this->hospedajeService->buscarHospedajes();
            echo json_encode([
                'success' => true,
                'hospedajes' => $hospedajes
            ]);
        } catch (Exception $e) {
            error_log("Error en HospedajeController::handleGet: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function handlePost() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('Datos inválidos');
        }

        $hospedajeId = $this->hospedajeService->crearHospedaje($data);
        echo json_encode(['id' => $hospedajeId]);
    }

    private function handlePut() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('ID de hospedaje no proporcionado');
        }

        $this->hospedajeService->actualizarHospedaje($data['id'], $data);
        echo json_encode(['success' => true]);
    }

    private function handleDelete() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            throw new Exception('ID de hospedaje no proporcionado');
        }

        $this->hospedajeService->eliminarHospedaje($id);
        echo json_encode(['success' => true]);
    }
} 