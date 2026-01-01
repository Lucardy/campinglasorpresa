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

    public function obtenerReserva($id) {
        $reserva = $this->reservaModel->findById($id);
        if (!$reserva) {
            throw new Exception('Reserva no encontrada');
        }
        return $reserva;
    }

    public function crearReserva($data) {
        // Validar campos requeridos
        $requiredFields = ['cliente_id', 'fecha_entrada', 'fecha_salida', 'cantidad_personas', 'monto_total'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("El campo {$field} es requerido");
            }
        }

        // Validar fechas
        $fechaEntrada = new DateTime($data['fecha_entrada']);
        $fechaSalida = new DateTime($data['fecha_salida']);
        
        if ($fechaEntrada >= $fechaSalida) {
            throw new Exception('La fecha de entrada debe ser anterior a la fecha de salida');
        }

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

        // Crear la reserva
        return $this->reservaModel->create($data);
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
} 