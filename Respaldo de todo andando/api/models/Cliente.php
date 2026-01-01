<?php
class Cliente {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("
            SELECT c.*, 
                   COUNT(DISTINCT r.id) as total_reservas,
                   SUM(r.monto_total) as monto_total_reservas
            FROM clientes c
            LEFT JOIN reservas r ON c.id = r.cliente_id
            WHERE c.id = ?
            GROUP BY c.id
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findAll() {
        $stmt = $this->pdo->query("
            SELECT c.*, 
                   COUNT(DISTINCT r.id) as total_reservas,
                   SUM(r.monto_total) as monto_total_reservas
            FROM clientes c
            LEFT JOIN reservas r ON c.id = r.cliente_id
            GROUP BY c.id
            ORDER BY c.apellido, c.nombre
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function search($searchTerm) {
        $search = '%' . $searchTerm . '%';
        $stmt = $this->pdo->prepare("
            SELECT c.*, 
                   COUNT(DISTINCT r.id) as total_reservas,
                   SUM(r.monto_total) as monto_total_reservas
            FROM clientes c
            LEFT JOIN reservas r ON c.id = r.cliente_id
            WHERE c.apellido LIKE :search 
            OR c.nombre LIKE :search 
            OR c.documento LIKE :search
            OR c.telefono LIKE :search
            GROUP BY c.id
            ORDER BY c.apellido, c.nombre
        ");
        $stmt->execute([':search' => $search]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO clientes (
                apellido, nombre, documento, modelo_vehiculo, patente, telefono
            ) VALUES (
                :apellido, :nombre, :documento, :modelo_vehiculo, :patente, :telefono
            )
        ");

        $stmt->execute([
            ':apellido' => $data['apellido'],
            ':nombre' => $data['nombre'],
            ':documento' => $data['documento'],
            ':modelo_vehiculo' => $data['modelo_vehiculo'] ?? null,
            ':patente' => $data['patente'] ?? null,
            ':telefono' => $data['telefono'] ?? null
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data) {
        $updates = [];
        $params = [':id' => $id];

        $fields = [
            'apellido', 'nombre', 'documento', 'modelo_vehiculo', 
            'patente', 'telefono'
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

        $sql = "UPDATE clientes SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount() > 0;
    }

    public function delete($id) {
        try {
            // Verificar si el cliente tiene reservas
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) 
                FROM reservas 
                WHERE cliente_id = ? 
                AND estado != 'cancelada'
            ");
            $stmt->execute([$id]);
            
            if ($stmt->fetchColumn() > 0) {
                throw new Exception('No se puede eliminar el cliente porque tiene reservas activas');
            }

            // Eliminar el cliente
            $stmt = $this->pdo->prepare("DELETE FROM clientes WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('No se encontró el cliente a eliminar');
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error en Cliente::delete: " . $e->getMessage());
            throw $e;
        }
    }

    public function findByDocumento($documento) {
        $stmt = $this->pdo->prepare("SELECT * FROM clientes WHERE documento = ?");
        $stmt->execute([$documento]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
} 