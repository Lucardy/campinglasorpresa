<?php
class Hospedaje {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("
            SELECT h.*, th.nombre as tipo_hospedaje,
                   COUNT(DISTINCT r.id) as total_reservas,
                   SUM(r.monto_total) as monto_total_reservas
            FROM hospedajes h
            JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            LEFT JOIN reservas r ON h.id = r.hospedaje_id
            WHERE h.id = ?
            GROUP BY h.id
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findAll() {
        $stmt = $this->pdo->query("
            SELECT h.*, th.nombre as tipo_hospedaje,
                   COUNT(DISTINCT r.id) as total_reservas,
                   SUM(r.monto_total) as monto_total_reservas
            FROM hospedajes h
            JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            LEFT JOIN reservas r ON h.id = r.hospedaje_id
            GROUP BY h.id
            ORDER BY th.id, h.id
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function search($searchTerm) {
        $search = '%' . $searchTerm . '%';
        $stmt = $this->pdo->prepare("
            SELECT h.*, th.nombre as tipo_hospedaje,
                   COUNT(DISTINCT r.id) as total_reservas,
                   SUM(r.monto_total) as monto_total_reservas
            FROM hospedajes h
            JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            LEFT JOIN reservas r ON h.id = r.hospedaje_id
            WHERE h.numero LIKE :search 
            OR th.nombre LIKE :search
            OR h.observaciones LIKE :search
            GROUP BY h.id
            ORDER BY h.numero
        ");
        $stmt->execute([':search' => $search]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO hospedajes (
                numero, tipo_hospedaje_id, capacidad,
                estado, observaciones
            ) VALUES (
                :numero, :tipo_hospedaje_id, :capacidad,
                :estado, :observaciones
            )
        ");

        $stmt->execute([
            ':numero' => $data['numero'],
            ':tipo_hospedaje_id' => $data['tipo_hospedaje_id'],
            ':capacidad' => $data['capacidad'],
            ':estado' => $data['estado'] ?? 'activo',
            ':observaciones' => $data['observaciones'] ?? null
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data) {
        $updates = [];
        $params = [':id' => $id];

        $fields = [
            'numero', 'tipo_hospedaje_id', 'capacidad',
            'estado', 'observaciones'
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

        $sql = "UPDATE hospedajes SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount() > 0;
    }

    public function delete($id) {
        // Verificar si el hospedaje tiene reservas
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM reservas WHERE hospedaje_id = ?");
        $stmt->execute([$id]);
        if ($stmt->fetchColumn() > 0) {
            throw new Exception('No se puede eliminar el hospedaje porque tiene reservas asociadas');
        }

        $stmt = $this->pdo->prepare("DELETE FROM hospedajes WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function findByNumero($numero) {
        $stmt = $this->pdo->prepare("SELECT * FROM hospedajes WHERE numero = ?");
        $stmt->execute([$numero]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getTiposHospedaje() {
        $stmt = $this->pdo->query("SELECT id, nombre, descripcion FROM tipos_hospedaje ORDER BY nombre");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT h.*, th.nombre as tipo_hospedaje_nombre
                FROM hospedajes h
                INNER JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
                WHERE h.id = :id
            ");
            $stmt->execute([':id' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en getById: ' . $e->getMessage());
            throw new Exception('Error al obtener el hospedaje');
        }
    }

    public function checkDisponibilidad($id, $fechaEntrada, $fechaSalida) {
        try {
            error_log("Verificando disponibilidad para hospedaje: " . $id . " en fechas: " . $fechaEntrada . " - " . $fechaSalida);
            
            // Primero verificar que el hospedaje existe y está activo
            $hospedaje = $this->getById($id);
            if (!$hospedaje) {
                throw new Exception('El hospedaje no existe');
            }
            if ($hospedaje['estado'] !== 'activo') {
                throw new Exception('El hospedaje no está activo');
            }

            $sql = "SELECT COUNT(*) as count
                    FROM reservas r
                    INNER JOIN hospedajes h ON r.hospedaje_id = h.id
                    WHERE h.id = :hospedaje_id
                    AND h.estado = 'activo'
                    AND r.estado = 'activa'
                    AND (
                        (r.fecha_entrada < :fecha_salida AND DATE_SUB(r.fecha_salida, INTERVAL 1 DAY) >= :fecha_entrada)
                    )";

            error_log("SQL Query: " . $sql);
            error_log("Parámetros: " . json_encode([
                ':hospedaje_id' => $id,
                ':fecha_entrada' => $fechaEntrada,
                ':fecha_salida' => $fechaSalida
            ]));

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':hospedaje_id' => $id,
                ':fecha_entrada' => $fechaEntrada,
                ':fecha_salida' => $fechaSalida
            ]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("Resultado de disponibilidad: " . json_encode($result));

            return $result['count'] === 0;
        } catch (Exception $e) {
            error_log('Error en checkDisponibilidad: ' . $e->getMessage());
            throw new Exception('Error al verificar disponibilidad: ' . $e->getMessage());
        }
    }

    public function getHospedajesDisponibles($fechaEntrada, $fechaSalida, $tipoHospedajeId) {
        try {
            if (empty($tipoHospedajeId)) {
                throw new Exception('El ID del tipo de hospedaje es requerido');
            }

            error_log("Buscando hospedajes del tipo: " . $tipoHospedajeId . " para las fechas: " . $fechaEntrada . " - " . $fechaSalida);

            // Consulta para obtener hospedajes disponibles
            $sql = "SELECT DISTINCT h.*, th.nombre as tipo_hospedaje_nombre 
                    FROM hospedajes h 
                    INNER JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id 
                    LEFT JOIN reservas r ON h.id = r.hospedaje_id 
                        AND r.estado = 'activa'
                        AND (
                            (r.fecha_entrada < :fecha_salida AND DATE_SUB(r.fecha_salida, INTERVAL 1 DAY) >= :fecha_entrada)
                        )
                    WHERE h.tipo_hospedaje_id = :tipo_hospedaje_id 
                    AND h.estado = 'activo'
                    AND (r.id IS NULL OR r.estado != 'activa')
                    ORDER BY h.numero";

            error_log("SQL Query: " . $sql);

            $stmt = $this->pdo->prepare($sql);
            if (!$stmt) {
                error_log("Error al preparar la consulta: " . print_r($this->pdo->errorInfo(), true));
                throw new Exception('Error al preparar la consulta');
            }

            $params = [
                ':tipo_hospedaje_id' => $tipoHospedajeId,
                ':fecha_entrada' => $fechaEntrada,
                ':fecha_salida' => $fechaSalida
            ];
            error_log("Parámetros de la consulta: " . json_encode($params));

            $stmt->execute($params);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("Resultados encontrados: " . count($result));
            error_log("Hospedajes encontrados: " . json_encode($result));

            return $result;
        } catch (Exception $e) {
            error_log('Error en getHospedajesDisponibles: ' . $e->getMessage());
            throw new Exception('Error al obtener hospedajes disponibles: ' . $e->getMessage());
        }
    }

    public function getTipoHospedaje($id) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM tipos_hospedaje WHERE id = ?");
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en getTipoHospedaje: ' . $e->getMessage());
            throw new Exception('Error al obtener el tipo de hospedaje');
        }
    }

    public function getCantidadesPersonasDisponibles($tipoHospedajeId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT DISTINCT cantidad_personas 
                FROM precios_hospedaje 
                WHERE tipo_hospedaje_id = ? 
                ORDER BY cantidad_personas
            ");
            $stmt->execute([$tipoHospedajeId]);
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            error_log('Error en getCantidadesPersonasDisponibles: ' . $e->getMessage());
            throw new Exception('Error al obtener las cantidades de personas disponibles');
        }
    }
} 