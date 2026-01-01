<?php
class Pago {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getPdo() {
        return $this->pdo;
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("
            SELECT p.*, r.monto_total as reserva_monto_total
            FROM pagos p
            JOIN reservas r ON p.reserva_id = r.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByReservaId($reservaId) {
        $stmt = $this->pdo->prepare("
            SELECT p.*
            FROM pagos p
            WHERE p.reserva_id = ?
            ORDER BY p.fecha_pago ASC
        ");
        $stmt->execute([$reservaId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTotalPagado($reservaId) {
        $stmt = $this->pdo->prepare("
            SELECT COALESCE(SUM(monto), 0) as total_pagado
            FROM pagos
            WHERE reserva_id = ?
        ");
        $stmt->execute([$reservaId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return floatval($result['total_pagado']);
    }

    public function create($data) {
        $this->pdo->beginTransaction();
        
        try {
            // Insertar el pago
            $stmt = $this->pdo->prepare("
                INSERT INTO pagos (reserva_id, monto, metodo_pago, observaciones)
                VALUES (:reserva_id, :monto, :metodo_pago, :observaciones)
            ");
            
            $stmt->execute([
                ':reserva_id' => $data['reserva_id'],
                ':monto' => $data['monto'],
                ':metodo_pago' => $data['metodo_pago'],
                ':observaciones' => $data['observaciones'] ?? null
            ]);
            
            $pagoId = $this->pdo->lastInsertId();
            
            // Actualizar estado_pago de la reserva
            $this->actualizarEstadoPago($data['reserva_id']);
            
            $this->pdo->commit();
            return $pagoId;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function update($id, $data) {
        $this->pdo->beginTransaction();
        
        try {
            // Obtener el pago para saber la reserva_id
            $pago = $this->findById($id);
            if (!$pago) {
                throw new Exception('Pago no encontrado');
            }
            
            $updates = [];
            $params = [':id' => $id];
            
            $fields = ['monto', 'metodo_pago', 'observaciones'];
            foreach ($fields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "{$field} = :{$field}";
                    $params[":{$field}"] = $data[$field];
                }
            }
            
            if (empty($updates)) {
                throw new Exception('No se proporcionaron datos para actualizar');
            }
            
            $sql = "UPDATE pagos SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            // Actualizar estado_pago de la reserva
            $this->actualizarEstadoPago($pago['reserva_id']);
            
            $this->pdo->commit();
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function delete($id) {
        $this->pdo->beginTransaction();
        
        try {
            // Obtener el pago para saber la reserva_id
            $pago = $this->findById($id);
            if (!$pago) {
                throw new Exception('Pago no encontrado');
            }
            
            $reservaId = $pago['reserva_id'];
            
            // Eliminar el pago
            $stmt = $this->pdo->prepare("DELETE FROM pagos WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('Pago no encontrado');
            }
            
            // Actualizar estado_pago de la reserva
            $this->actualizarEstadoPago($reservaId);
            
            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    private function actualizarEstadoPago($reservaId) {
        // Obtener monto total de la reserva
        $stmt = $this->pdo->prepare("SELECT monto_total FROM reservas WHERE id = ?");
        $stmt->execute([$reservaId]);
        $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reserva) {
            return;
        }
        
        $montoTotal = floatval($reserva['monto_total']);
        $totalPagado = $this->getTotalPagado($reservaId);
        
        // Determinar estado
        $estadoPago = 'pendiente';
        if ($totalPagado >= $montoTotal) {
            $estadoPago = 'completo';
        } elseif ($totalPagado > 0) {
            $estadoPago = 'parcial';
        }
        
        // Actualizar estado_pago en la reserva
        $stmt = $this->pdo->prepare("UPDATE reservas SET estado_pago = ? WHERE id = ?");
        $stmt->execute([$estadoPago, $reservaId]);
    }
}

