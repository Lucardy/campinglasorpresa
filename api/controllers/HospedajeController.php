<?php
require_once __DIR__ . '/../services/HospedajeService.php';

class HospedajeController {
    private $hospedajeService;
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
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
        // Desactivar la salida de errores de PHP
        ini_set('display_errors', 0);
        error_reporting(E_ALL);
        
        // Asegurar que siempre devolvemos JSON
        header('Content-Type: application/json');
        
        try {
            error_log("Iniciando handleGet en HospedajeController");
            error_log("Parámetros recibidos: " . json_encode($_GET));
            
            // Si no hay parámetros específicos, devolver tipos de hospedaje y hospedajes
            if (empty($_GET)) {
                try {
                    $tiposHospedaje = $this->hospedajeService->getTiposHospedaje();
                    $hospedajes = $this->hospedajeService->getAllHospedajes();
                    
                    echo json_encode([
                        'success' => true,
                        'tipos_hospedaje' => $tiposHospedaje,
                        'hospedajes' => $hospedajes
                    ]);
                    return;
                } catch (Exception $e) {
                    error_log("Error al obtener datos generales: " . $e->getMessage());
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al obtener datos generales',
                        'details' => $e->getMessage()
                    ]);
                    return;
                }
            }
            
            // Verificar disponibilidad de hospedajes
            if (isset($_GET['disponibilidad']) && $_GET['disponibilidad'] == '1') {
                try {
                    $tipoHospedajeId = $_GET['tipo_hospedaje_id'] ?? null;
                    $fechaEntrada = $_GET['fecha_entrada'] ?? null;
                    $fechaSalida = $_GET['fecha_salida'] ?? null;
                    
                    if (!$tipoHospedajeId || !$fechaEntrada || !$fechaSalida) {
                        throw new Exception('Se requieren tipo_hospedaje_id, fecha_entrada y fecha_salida');
                    }
                    
                    error_log("Verificando disponibilidad para tipo: $tipoHospedajeId, fechas: $fechaEntrada - $fechaSalida");
                    
                    $hospedajesDisponibles = $this->hospedajeService->obtenerHospedajesDisponibles(
                        $fechaEntrada,
                        $fechaSalida,
                        $tipoHospedajeId
                    );
                    
                    echo json_encode([
                        'success' => true,
                        'hospedajes' => $hospedajesDisponibles,
                        'filtros' => [
                            'tipo_hospedaje_id' => $tipoHospedajeId,
                            'fecha_entrada' => $fechaEntrada,
                            'fecha_salida' => $fechaSalida
                        ]
                    ]);
                    return;
                } catch (Exception $e) {
                    error_log("Error al verificar disponibilidad: " . $e->getMessage());
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al verificar disponibilidad',
                        'details' => $e->getMessage()
                    ]);
                    return;
                }
            }
            
            // Obtener precios de camping
            if (isset($_GET['precios_camping'])) {
                try {
                    error_log("Procesando petición de precios_camping");
                    
                    // Verificar si la tabla existe
                    $stmt = $this->pdo->query("SHOW TABLES LIKE 'precios_camping'");
                    if ($stmt->rowCount() === 0) {
                        error_log("La tabla precios_camping no existe");
                        echo json_encode([
                            'success' => false,
                            'error' => 'La tabla de precios de camping no existe'
                        ]);
                        return;
                    }
                    error_log("La tabla precios_camping existe");

                    // Obtener el método de pago del parámetro o usar efectivo por defecto
                    $metodoPago = $_GET['metodo_pago'] ?? 'efectivo';
                    
                    $stmt = $this->pdo->prepare("
                        SELECT tipo, precio 
                        FROM precios_camping 
                        WHERE tipo IN ('base', 'adulto', 'menor')
                        AND metodo_pago = ?
                    ");
                    $stmt->execute([$metodoPago]);
                    $precios = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
                    
                    error_log("Precios encontrados: " . json_encode($precios));
                    
                    if (empty($precios)) {
                        error_log("No se encontraron precios de camping");
                        echo json_encode([
                            'success' => false,
                            'error' => 'No se encontraron precios de camping'
                        ]);
                        return;
                    }

                    // Verificar que tenemos todos los precios necesarios
                    $preciosRequeridos = ['base', 'adulto', 'menor'];
                    $preciosFaltantes = array_diff($preciosRequeridos, array_keys($precios));
                    
                    if (!empty($preciosFaltantes)) {
                        error_log("Faltan precios: " . implode(', ', $preciosFaltantes));
                        echo json_encode([
                            'success' => false,
                            'error' => 'Faltan precios de camping: ' . implode(', ', $preciosFaltantes)
                        ]);
                        return;
                    }
                    
                    error_log("Enviando respuesta exitosa");
                    echo json_encode([
                        'success' => true,
                        'precios' => $precios
                    ]);
                    return;
                } catch (Exception $e) {
                    error_log("Error al obtener precios de camping: " . $e->getMessage());
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al obtener precios de camping',
                        'details' => $e->getMessage()
                    ]);
                    return;
                }
            }

            // Obtener precio por tipo y cantidad de personas
            if (isset($_GET['precio'])) {
                $tipoHospedajeId = $_GET['tipo_hospedaje_id'] ?? null;
                $cantidadPersonas = $_GET['cantidad_personas'] ?? null;
                $metodoPago = $_GET['metodo_pago'] ?? 'efectivo';
                
                if (!$tipoHospedajeId || !$cantidadPersonas) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'Faltan parámetros requeridos'
                    ]);
                    return;
                }
                
                $precio = $this->hospedajeService->getPrecioHospedaje($tipoHospedajeId, $cantidadPersonas, $metodoPago);
                
                if ($precio === null) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'No se encontró precio para los parámetros especificados'
                    ]);
                    return;
                }
                
                echo json_encode([
                    'success' => true,
                    'precio' => $precio
                ]);
                return;
            }

            // Obtener cantidades de personas disponibles
            if (isset($params['cantidades_personas'])) {
                if (!isset($params['tipo_hospedaje_id'])) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'Se requiere el tipo de hospedaje'
                    ]);
                    return;
                }

                try {
                    $cantidades = $this->hospedajeService->getCantidadesPersonasDisponibles($params['tipo_hospedaje_id']);
                    echo json_encode([
                        'success' => true,
                        'cantidades' => $cantidades
                    ]);
                    return;
                } catch (Exception $e) {
                    error_log('Error al obtener cantidades: ' . $e->getMessage());
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al obtener las cantidades: ' . $e->getMessage()
                    ]);
                    return;
                }
            }

            // Obtener precio por tipo de hospedaje y cantidad de personas
            if (isset($params['precio'])) {
                if (!isset($params['tipo_hospedaje_id']) || !isset($params['cantidad_personas'])) {
                    echo json_encode([
                        'success' => false,
                        'error' => 'Se requieren el tipo de hospedaje y la cantidad de personas'
                    ]);
                    return;
                }

                $metodoPago = $params['metodo_pago'] ?? 'efectivo';

                try {
                    $precio = $this->hospedajeService->getPrecioHospedaje(
                        $params['tipo_hospedaje_id'],
                        $params['cantidad_personas'],
                        $metodoPago
                    );

                    echo json_encode([
                        'success' => true,
                        'precio' => $precio
                    ]);
                    return;
                } catch (Exception $e) {
                    error_log('Error al obtener precio: ' . $e->getMessage());
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al obtener el precio: ' . $e->getMessage()
                    ]);
                    return;
                }
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

            // Obtener todos los precios para gestión (con información completa)
            if (isset($params['todos_precios'])) {
                try {
                    $precios = $this->hospedajeService->getAllPrecios();
                    echo json_encode([
                        'success' => true,
                        'precios' => $precios
                    ]);
                    return;
                } catch (Exception $e) {
                    error_log('Error al obtener todos los precios: ' . $e->getMessage());
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al obtener los precios: ' . $e->getMessage()
                    ]);
                    return;
                }
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

            // Obtener un hospedaje por ID
            if (isset($params['id']) && !isset($params['disponibilidad'])) {
                if (!is_numeric($params['id'])) {
                    throw new Exception('ID de hospedaje inválido');
                }

                try {
                    $hospedaje = $this->hospedajeService->obtenerHospedaje($params['id']);
                    echo json_encode([
                        'success' => true,
                        'hospedaje' => $hospedaje
                    ]);
                    return;
                } catch (Exception $e) {
                    error_log('Error al obtener hospedaje: ' . $e->getMessage());
                    echo json_encode([
                        'success' => false,
                        'error' => 'Error al obtener el hospedaje: ' . $e->getMessage()
                    ]);
                    return;
                }
            }

            // Obtener todos los hospedajes
            $hospedajes = $this->hospedajeService->buscarHospedajes();
            echo json_encode([
                'success' => true,
                'hospedajes' => $hospedajes
            ]);
        } catch (Exception $e) {
            error_log("Error en HospedajeController::handleGet: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor'
            ]);
            return;
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
            throw new Exception('ID no proporcionado');
        }

        // Si es una actualización de precio
        if (isset($data['precio'])) {
            try {
                $this->hospedajeService->actualizarPrecio($data['id'], $data['precio']);
                echo json_encode(['success' => true]);
                return;
            } catch (Exception $e) {
                error_log('Error al actualizar precio: ' . $e->getMessage());
                echo json_encode([
                    'success' => false,
                    'error' => $e->getMessage()
                ]);
                return;
            }
        }

        // Si es una actualización de hospedaje
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

    private function respondWithError($message) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit;
    }

    private function respondWithSuccess($data) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            ...$data
        ]);
        exit;
    }
} 