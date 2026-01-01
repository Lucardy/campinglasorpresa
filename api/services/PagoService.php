<?php
require_once __DIR__ . '/../models/Pago.php';

class PagoService {
    private $pagoModel;

    public function __construct($pdo) {
        $this->pagoModel = new Pago($pdo);
    }

    public function obtenerPagosPorReserva($reservaId) {
        return $this->pagoModel->findByReservaId($reservaId);
    }

    public function obtenerPago($id) {
        $pago = $this->pagoModel->findById($id);
        if (!$pago) {
            throw new Exception('Pago no encontrado');
        }
        return $pago;
    }

    public function crearPago($data) {
        // Validar campos requeridos
        $requiredFields = ['reserva_id', 'monto', 'metodo_pago'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("El campo {$field} es requerido");
            }
        }

        // Validar que el monto sea positivo
        if (floatval($data['monto']) <= 0) {
            throw new Exception('El monto debe ser mayor a 0');
        }

        // Validar que la reserva existe
        $pdo = $this->pagoModel->getPdo();
        $stmt = $pdo->prepare("SELECT id, monto_total FROM reservas WHERE id = ?");
        $stmt->execute([$data['reserva_id']]);
        $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reserva) {
            throw new Exception('La reserva no existe');
        }

        // Validar que no se exceda el monto total
        $totalPagado = $this->pagoModel->getTotalPagado($data['reserva_id']);
        $nuevoTotal = $totalPagado + floatval($data['monto']);
        
        if ($nuevoTotal > floatval($reserva['monto_total'])) {
            throw new Exception('El monto total de los pagos no puede exceder el monto total de la reserva');
        }

        return $this->pagoModel->create($data);
    }

    public function actualizarPago($id, $data) {
        // Validar que el pago existe
        $pago = $this->pagoModel->findById($id);
        if (!$pago) {
            throw new Exception('Pago no encontrado');
        }

        // Si se actualiza el monto, validar que no se exceda el total
        if (isset($data['monto'])) {
            if (floatval($data['monto']) <= 0) {
                throw new Exception('El monto debe ser mayor a 0');
            }

            $pdo = $this->pagoModel->getPdo();
            $stmt = $pdo->prepare("SELECT monto_total FROM reservas WHERE id = ?");
            $stmt->execute([$pago['reserva_id']]);
            $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $totalPagado = $this->pagoModel->getTotalPagado($pago['reserva_id']);
            $montoAnterior = floatval($pago['monto']);
            $nuevoTotal = $totalPagado - $montoAnterior + floatval($data['monto']);
            
            if ($nuevoTotal > floatval($reserva['monto_total'])) {
                throw new Exception('El monto total de los pagos no puede exceder el monto total de la reserva');
            }
        }

        return $this->pagoModel->update($id, $data);
    }

    public function eliminarPago($id) {
        // Validar que el pago existe
        $pago = $this->pagoModel->findById($id);
        if (!$pago) {
            throw new Exception('Pago no encontrado');
        }

        return $this->pagoModel->delete($id);
    }

    public function getTotalPagado($reservaId) {
        return $this->pagoModel->getTotalPagado($reservaId);
    }
}

