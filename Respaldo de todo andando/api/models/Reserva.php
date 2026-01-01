<?php
class Reserva {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("
            SELECT r.*, c.apellido, c.nombre, 
                   COALESCE(h.numero, 'Camping') as numero_hospedaje, 
                   COALESCE(th.nombre, 'camping') as tipo_hospedaje
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
            LEFT JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findAll() {
        $stmt = $this->pdo->query("
            SELECT r.*, c.apellido, c.nombre, 
                   COALESCE(h.numero, 'Camping') as numero_hospedaje, 
                   COALESCE(th.nombre, 'camping') as tipo_hospedaje
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
            LEFT JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            ORDER BY r.fecha_entrada DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function search($searchTerm) {
        $search = '%' . $searchTerm . '%';
        $stmt = $this->pdo->prepare("
            SELECT r.*, c.apellido, c.nombre, 
                   COALESCE(h.numero, 'Camping') as numero_hospedaje, 
                   COALESCE(th.nombre, 'camping') as tipo_hospedaje
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
            LEFT JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            WHERE c.apellido LIKE :search 
            OR c.nombre LIKE :search 
            OR COALESCE(h.numero, 'Camping') LIKE :search 
            OR COALESCE(th.nombre, 'camping') LIKE :search
            OR r.observaciones LIKE :search
            ORDER BY r.fecha_entrada DESC
        ");
        $stmt->execute([':search' => $search]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO reservas (
                cliente_id, hospedaje_id, fecha_entrada, fecha_salida,
                cantidad_personas, monto_total, estado, observaciones
            ) VALUES (
                :cliente_id, :hospedaje_id, :fecha_entrada, :fecha_salida,
                :cantidad_personas, :monto_total, :estado, :observaciones
            )
        ");

        $stmt->execute([
            ':cliente_id' => $data['cliente_id'],
            ':hospedaje_id' => $data['hospedaje_id'] ?? null,
            ':fecha_entrada' => $data['fecha_entrada'],
            ':fecha_salida' => $data['fecha_salida'],
            ':cantidad_personas' => $data['cantidad_personas'],
            ':monto_total' => $data['monto_total'],
            ':estado' => $data['estado'] ?? 'activa',
            ':observaciones' => $data['observaciones'] ?? null
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data) {
        $updates = [];
        $params = [':id' => $id];

        $fields = [
            'hospedaje_id', 'fecha_entrada', 'fecha_salida',
            'cantidad_personas', 'monto_total', 'estado', 'observaciones'
        ];

        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "{$field} = :{$field}";
                $params[":{$field}"] = $data[$field];
            }
        }

        if (empty($updates)) {
            throw new Exception('No se proporcionaron datos para actualizar');
        }

        $sql = "UPDATE reservas SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount() > 0;
    }

    public function delete($id) {
        $this->pdo->beginTransaction();

        try {
            // Eliminar pagos asociados
            $stmt = $this->pdo->prepare("DELETE FROM pagos WHERE reserva_id = ?");
            $stmt->execute([$id]);

            // Eliminar la reserva
            $stmt = $this->pdo->prepare("DELETE FROM reservas WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                throw new Exception('Reserva no encontrada');
            }

            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function checkAvailability($hospedajeId, $fechaEntrada, $fechaSalida, $excludeReservaId = null) {
        $sql = "
            SELECT COUNT(*) as count
            FROM reservas
            WHERE hospedaje_id = :hospedaje_id
            AND estado = 'activa'
            AND (
                (fecha_entrada BETWEEN :fecha_entrada AND :fecha_salida)
                OR (fecha_salida BETWEEN :fecha_entrada AND :fecha_salida)
                OR (:fecha_entrada BETWEEN fecha_entrada AND fecha_salida)
            )
        ";

        $params = [
            ':hospedaje_id' => $hospedajeId,
            ':fecha_entrada' => $fechaEntrada,
            ':fecha_salida' => $fechaSalida
        ];

        if ($excludeReservaId) {
            $sql .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeReservaId;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['count'] === 0;
    }
} 