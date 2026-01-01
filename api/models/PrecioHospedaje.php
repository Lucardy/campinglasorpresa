<?php
class PrecioHospedaje {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getPrecio($tipoHospedajeId, $cantidadPersonas, $metodoPago = 'efectivo') {
        try {
            if ($tipoHospedajeId == 3) { // Camping
                // Verificar si la tabla existe
                $stmt = $this->pdo->query("SHOW TABLES LIKE 'precios_camping'");
                if ($stmt->rowCount() === 0) {
                    error_log("La tabla precios_camping no existe");
                    return null;
                }

                // Obtener los precios
                $stmt = $this->pdo->prepare("
                    SELECT tipo, precio 
                    FROM precios_camping 
                    WHERE tipo IN ('base', 'adulto', 'menor') 
                    AND metodo_pago = ?
                ");
                $stmt->execute([$metodoPago]);
                $precios = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
                
                // Verificar que tenemos todos los precios necesarios
                $preciosRequeridos = ['base', 'adulto', 'menor'];
                $preciosFaltantes = array_diff($preciosRequeridos, array_keys($precios));
                
                if (!empty($preciosFaltantes)) {
                    error_log("Faltan precios de camping: " . implode(', ', $preciosFaltantes));
                    return null;
                }
                
                // Calcular el precio total
                $precioBase = floatval($precios['base']);
                $precioAdulto = floatval($precios['adulto']);
                $cantidadPersonas = intval($cantidadPersonas);
                
                if ($precioBase === 0 || $precioAdulto === 0) {
                    error_log("Precios inválidos: base={$precioBase}, adulto={$precioAdulto}");
                    return null;
                }
                
                $precioTotal = $precioBase + ($cantidadPersonas * $precioAdulto);
                
                // Para camping, transferencia y efectivo tienen el mismo precio
                // No se aplica recargo
                
                return $precioTotal;
            }
            
            // Para otros tipos de hospedaje
            $stmt = $this->pdo->prepare("
                SELECT precio 
                FROM precios_hospedaje 
                WHERE tipo_hospedaje_id = ? AND cantidad_personas = ? AND metodo_pago = ?
            ");
            $stmt->execute([$tipoHospedajeId, $cantidadPersonas, $metodoPago]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result || !isset($result['precio'])) {
                error_log("No se encontró precio para tipo_hospedaje_id={$tipoHospedajeId}, cantidad_personas={$cantidadPersonas}, metodo_pago={$metodoPago}");
                return null;
            }
            
            $precio = floatval($result['precio']);
            if ($precio === 0) {
                error_log("Precio inválido para tipo_hospedaje_id={$tipoHospedajeId}, cantidad_personas={$cantidadPersonas}, metodo_pago={$metodoPago}");
                return null;
            }
            
            return $precio;
        } catch (Exception $e) {
            error_log("Error en getPrecio: " . $e->getMessage());
            return null;
        }
    }

    public function getAllPrecios() {
        // Obtener precios de hospedaje
        $stmt = $this->pdo->query("
            SELECT 
                ph.*, 
                th.nombre as tipo_hospedaje_nombre,
                'hospedaje' as tipo_tabla
            FROM precios_hospedaje ph
            JOIN tipos_hospedaje th ON ph.tipo_hospedaje_id = th.id
            ORDER BY th.nombre, ph.cantidad_personas, ph.metodo_pago
        ");
        $preciosHospedaje = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Obtener precios de camping
        $stmt = $this->pdo->query("
            SELECT 
                id,
                tipo as tipo_precio,
                precio,
                metodo_pago,
                'Camping' as tipo_hospedaje_nombre,
                'camping' as tipo_tabla,
                CASE 
                    WHEN tipo = 'base' THEN 'Precio Base'
                    WHEN tipo = 'adulto' THEN 'Precio por Adulto'
                    WHEN tipo = 'menor' THEN 'Precio por Menor'
                    ELSE tipo
                END as descripcion
            FROM precios_camping
            ORDER BY 
                CASE tipo 
                    WHEN 'base' THEN 1 
                    WHEN 'adulto' THEN 2 
                    WHEN 'menor' THEN 3 
                    ELSE 4 
                END,
                metodo_pago
        ");
        $preciosCamping = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_merge($preciosHospedaje, $preciosCamping);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO precios_hospedaje (
                tipo_hospedaje_id, 
                cantidad_personas, 
                metodo_pago,
                precio
            ) VALUES (
                :tipo_hospedaje_id,
                :cantidad_personas,
                :metodo_pago,
                :precio
            )
        ");

        $stmt->execute([
            ':tipo_hospedaje_id' => $data['tipo_hospedaje_id'],
            ':cantidad_personas' => $data['cantidad_personas'],
            ':metodo_pago' => $data['metodo_pago'] ?? 'efectivo',
            ':precio' => $data['precio']
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data) {
        // Verificar si es un precio de camping o de hospedaje
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM precios_camping WHERE id = ?");
        $stmt->execute([$id]);
        $isCamping = $stmt->fetchColumn() > 0;

        if ($isCamping) {
            // Actualizar precio de camping
            $stmt = $this->pdo->prepare("
                UPDATE precios_camping 
                SET precio = :precio
                WHERE id = :id
            ");
        } else {
            // Actualizar precio de hospedaje
            $stmt = $this->pdo->prepare("
                UPDATE precios_hospedaje 
                SET precio = :precio
                WHERE id = :id
            ");
        }

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