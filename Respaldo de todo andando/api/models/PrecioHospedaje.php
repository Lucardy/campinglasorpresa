<?php
class PrecioHospedaje {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getPrecio($tipoHospedajeId, $cantidadPersonas) {
        $stmt = $this->pdo->prepare("
            SELECT precio 
            FROM precios_hospedaje 
            WHERE tipo_hospedaje_id = ? 
            AND cantidad_personas = ?
        ");
        $stmt->execute([$tipoHospedajeId, $cantidadPersonas]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['precio'] : null;
    }

    public function getAllPrecios() {
        $stmt = $this->pdo->query("
            SELECT ph.*, th.nombre as tipo_hospedaje_nombre
            FROM precios_hospedaje ph
            JOIN tipos_hospedaje th ON ph.tipo_hospedaje_id = th.id
            ORDER BY th.nombre, ph.cantidad_personas
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO precios_hospedaje (
                tipo_hospedaje_id, 
                cantidad_personas, 
                precio
            ) VALUES (
                :tipo_hospedaje_id,
                :cantidad_personas,
                :precio
            )
        ");

        $stmt->execute([
            ':tipo_hospedaje_id' => $data['tipo_hospedaje_id'],
            ':cantidad_personas' => $data['cantidad_personas'],
            ':precio' => $data['precio']
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->pdo->prepare("
            UPDATE precios_hospedaje 
            SET precio = :precio
            WHERE id = :id
        ");

        return $stmt->execute([
            ':id' => $id,
            ':precio' => $data['precio']
        ]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM precios_hospedaje WHERE id = ?");
        return $stmt->execute([$id]);
    }
} 