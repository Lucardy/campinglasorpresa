<?php
require_once __DIR__ . '/../models/Reserva.php';

class ReservaService {
    private $reservaModel;

    public function __construct($pdo) {
        $this->reservaModel = new Reserva($pdo);
    }

    public function buscarReservas($searchTerm = null) {
        if ($searchTerm) {
            return $this->reservaModel->search($searchTerm);
        }
        return $this->reservaModel->findAll();
    }

    public function buscarReservasPorCliente($clienteId) {
        return $this->reservaModel->findByClienteId($clienteId);
    }

    public function obtenerReserva($id) {
        $reserva = $this->reservaModel->findById($id);
        if (!$reserva) {
            throw new Exception('Reserva no encontrada');
        }
        return $reserva;
    }

    public function crearReserva($data) {
        // Log para debugging
        error_log("ReservaService::crearReserva - Iniciando con datos: " . json_encode($data));
        
        // Validar campos requeridos
        $requiredFields = ['cliente_id', 'fecha_entrada', 'fecha_salida', 'cantidad_personas', 'monto_total'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                error_log("Campo requerido faltante: {$field}");
                throw new Exception("El campo {$field} es requerido");
            }
        }

        error_log("ReservaService::crearReserva - Campos requeridos validados");

        // Verificar que el cliente existe
        try {
            error_log("ReservaService::crearReserva - Verificando cliente ID: " . $data['cliente_id']);
            $pdo = $this->reservaModel->getPdo();
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM clientes WHERE id = ?");
            $stmt->execute([$data['cliente_id']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] == 0) {
                error_log("Cliente no encontrado con ID: " . $data['cliente_id']);
                throw new Exception("El cliente con ID {$data['cliente_id']} no existe en la base de datos");
            }
            
            error_log("Cliente verificado - existe en la base de datos");
        } catch (Exception $e) {
            error_log("Error al verificar cliente: " . $e->getMessage());
            throw $e;
        }

        error_log("ReservaService::crearReserva - Cliente verificado exitosamente");

        // Validar fechas
        $fechaEntrada = new DateTime($data['fecha_entrada']);
        $fechaSalida = new DateTime($data['fecha_salida']);
        
        if ($fechaEntrada >= $fechaSalida) {
            throw new Exception('La fecha de entrada debe ser anterior a la fecha de salida');
        }

        error_log("ReservaService::crearReserva - Fechas validadas");

        // Verificar disponibilidad del hospedaje
        if (isset($data['hospedaje_id']) && !empty($data['hospedaje_id'])) {
            if (!$this->reservaModel->checkAvailability(
                $data['hospedaje_id'],
                $data['fecha_entrada'],
                $data['fecha_salida']
            )) {
                throw new Exception('El hospedaje ya está reservado para las fechas seleccionadas');
            }
        }

        error_log("ReservaService::crearReserva - Disponibilidad verificada");

        // Crear la reserva
        error_log("ReservaService::crearReserva - Llamando a create() del modelo");
        $reservaId = $this->reservaModel->create($data);
        error_log("ReservaService::crearReserva - Reserva creada exitosamente con ID: " . $reservaId);
        
        // Si hay seña (descuento > 0), crear un pago inicial
        if (isset($data['descuento']) && floatval($data['descuento']) > 0) {
            try {
                require_once __DIR__ . '/../models/Pago.php';
                $pagoModel = new Pago($this->reservaModel->getPdo());
                $pagoModel->create([
                    'reserva_id' => $reservaId,
                    'monto' => floatval($data['descuento']),
                    'metodo_pago' => $data['metodo_pago'] ?? 'efectivo',
                    'observaciones' => 'Seña inicial'
                ]);
                error_log("ReservaService::crearReserva - Pago inicial (seña) creado: " . $data['descuento']);
            } catch (Exception $e) {
                error_log("ReservaService::crearReserva - Error al crear pago inicial: " . $e->getMessage());
                // No lanzamos excepción para no fallar la creación de la reserva
            }
        }
        
        return $reservaId;
    }

    public function actualizarReserva($id, $data) {
        // Verificar que la reserva existe
        $reserva = $this->reservaModel->findById($id);
        if (!$reserva) {
            throw new Exception('Reserva no encontrada');
        }

        // Validar fechas si se están actualizando
        if (isset($data['fecha_entrada']) && isset($data['fecha_salida'])) {
            $fechaEntrada = new DateTime($data['fecha_entrada']);
            $fechaSalida = new DateTime($data['fecha_salida']);
            
            if ($fechaEntrada >= $fechaSalida) {
                throw new Exception('La fecha de entrada debe ser anterior a la fecha de salida');
            }
        }

        // Verificar disponibilidad si se cambia el hospedaje o las fechas
        if (isset($data['hospedaje_id']) || isset($data['fecha_entrada']) || isset($data['fecha_salida'])) {
            if (!$this->reservaModel->checkAvailability(
                $data['hospedaje_id'] ?? $reserva['hospedaje_id'],
                $data['fecha_entrada'] ?? $reserva['fecha_entrada'],
                $data['fecha_salida'] ?? $reserva['fecha_salida'],
                $id
            )) {
                throw new Exception('El hospedaje ya está reservado para las fechas seleccionadas');
            }
        }

        // Actualizar la reserva
        $success = $this->reservaModel->update($id, $data);
        if (!$success) {
            throw new Exception('Error al actualizar la reserva');
        }

        return true;
    }

    public function eliminarReserva($id) {
        // Verificar que la reserva existe
        $reserva = $this->reservaModel->findById($id);
        if (!$reserva) {
            throw new Exception('Reserva no encontrada');
        }

        // Eliminar la reserva y sus pagos asociados
        return $this->reservaModel->delete($id);
    }

    public function getReportesIngresos($filtros = []) {
        try {
            return $this->reservaModel->getReportesIngresos($filtros);
        } catch (Exception $e) {
            error_log('Error en getReportesIngresos: ' . $e->getMessage());
            throw new Exception('Error al obtener reportes de ingresos: ' . $e->getMessage());
        }
    }
} 