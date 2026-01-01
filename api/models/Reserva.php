<?php
class Reserva {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getPdo() {
        return $this->pdo;
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare("
            SELECT r.*, c.apellido, c.nombre, c.documento, c.telefono, c.modelo_vehiculo, c.patente,
                   CASE 
                       WHEN r.hospedaje_id IS NULL THEN 
                           CASE 
                               WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'Grupos'
                               ELSE 'Camping'
                           END
                       ELSE COALESCE(h.numero, 'Camping')
                   END as numero_hospedaje,
                   CASE 
                       WHEN r.hospedaje_id IS NULL THEN 
                           CASE 
                               WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'grupos'
                               ELSE 'camping'
                           END
                       ELSE COALESCE(th.nombre, 'camping')
                   END as tipo_hospedaje,
                   COALESCE((
                       SELECT SUM(monto) 
                       FROM pagos 
                       WHERE reserva_id = r.id
                   ), 0) as total_pagado
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
            LEFT JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Calcular estado_pago si no existe
        if ($reserva && !isset($reserva['estado_pago'])) {
            $totalPagado = floatval($reserva['total_pagado']);
            $montoTotal = floatval($reserva['monto_total']);
            
            if ($totalPagado >= $montoTotal) {
                $reserva['estado_pago'] = 'completo';
            } elseif ($totalPagado > 0) {
                $reserva['estado_pago'] = 'parcial';
            } else {
                $reserva['estado_pago'] = 'pendiente';
            }
        }
        
        return $reserva;
    }

    public function findAll() {
        $stmt = $this->pdo->query("
            SELECT r.*, c.apellido, c.nombre, c.documento, c.telefono, c.modelo_vehiculo, c.patente,
                   CASE 
                       WHEN r.hospedaje_id IS NULL THEN 
                           CASE 
                               WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'Grupos'
                               ELSE 'Camping'
                           END
                       ELSE COALESCE(h.numero, 'Camping')
                   END as numero_hospedaje,
                   CASE 
                       WHEN r.hospedaje_id IS NULL THEN 
                           CASE 
                               WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'grupos'
                               ELSE 'camping'
                           END
                       ELSE COALESCE(th.nombre, 'camping')
                   END as tipo_hospedaje,
                   COALESCE((
                       SELECT SUM(monto) 
                       FROM pagos 
                       WHERE reserva_id = r.id
                   ), 0) as total_pagado
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
            LEFT JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            ORDER BY r.fecha_entrada DESC
        ");
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular estado_pago para cada reserva si no existe
        foreach ($reservas as &$reserva) {
            if (!isset($reserva['estado_pago'])) {
                $totalPagado = floatval($reserva['total_pagado']);
                $montoTotal = floatval($reserva['monto_total']);
                
                if ($totalPagado >= $montoTotal) {
                    $reserva['estado_pago'] = 'completo';
                } elseif ($totalPagado > 0) {
                    $reserva['estado_pago'] = 'parcial';
                } else {
                    $reserva['estado_pago'] = 'pendiente';
                }
            }
        }
        
        return $reservas;
    }

    public function search($searchTerm) {
        $search = '%' . $searchTerm . '%';
        $stmt = $this->pdo->prepare("
            SELECT r.*, c.apellido, c.nombre, c.documento, c.telefono, c.modelo_vehiculo, c.patente,
                   CASE 
                       WHEN r.hospedaje_id IS NULL THEN 
                           CASE 
                               WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'Grupos'
                               ELSE 'Camping'
                           END
                       ELSE COALESCE(h.numero, 'Camping')
                   END as numero_hospedaje,
                   CASE 
                       WHEN r.hospedaje_id IS NULL THEN 
                           CASE 
                               WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'grupos'
                               ELSE 'camping'
                           END
                       ELSE COALESCE(th.nombre, 'camping')
                   END as tipo_hospedaje,
                   COALESCE((
                       SELECT SUM(monto) 
                       FROM pagos 
                       WHERE reserva_id = r.id
                   ), 0) as total_pagado
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
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular estado_pago para cada reserva si no existe
        foreach ($reservas as &$reserva) {
            if (!isset($reserva['estado_pago'])) {
                $totalPagado = floatval($reserva['total_pagado']);
                $montoTotal = floatval($reserva['monto_total']);
                
                if ($totalPagado >= $montoTotal) {
                    $reserva['estado_pago'] = 'completo';
                } elseif ($totalPagado > 0) {
                    $reserva['estado_pago'] = 'parcial';
                } else {
                    $reserva['estado_pago'] = 'pendiente';
                }
            }
        }
        
        return $reservas;
    }

    public function findByClienteId($clienteId) {
        $stmt = $this->pdo->prepare("
            SELECT r.*, c.apellido, c.nombre, c.documento, c.telefono, c.modelo_vehiculo, c.patente,
                   CASE 
                       WHEN r.hospedaje_id IS NULL THEN 
                           CASE 
                               WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'Grupos'
                               ELSE 'Camping'
                           END
                       ELSE COALESCE(h.numero, 'Camping')
                   END as numero_hospedaje,
                   CASE 
                       WHEN r.hospedaje_id IS NULL THEN 
                           CASE 
                               WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'grupos'
                               ELSE 'camping'
                           END
                       ELSE COALESCE(th.nombre, 'camping')
                   END as tipo_hospedaje,
                   COALESCE((
                       SELECT SUM(monto) 
                       FROM pagos 
                       WHERE reserva_id = r.id
                   ), 0) as total_pagado
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
            LEFT JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
            WHERE r.cliente_id = ?
            ORDER BY r.fecha_entrada DESC
        ");
        $stmt->execute([$clienteId]);
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular estado_pago para cada reserva si no existe
        foreach ($reservas as &$reserva) {
            if (!isset($reserva['estado_pago'])) {
                $totalPagado = floatval($reserva['total_pagado']);
                $montoTotal = floatval($reserva['monto_total']);
                
                if ($totalPagado >= $montoTotal) {
                    $reserva['estado_pago'] = 'completo';
                } elseif ($totalPagado > 0) {
                    $reserva['estado_pago'] = 'parcial';
                } else {
                    $reserva['estado_pago'] = 'pendiente';
                }
            }
        }
        
        return $reservas;
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO reservas (
                cliente_id, hospedaje_id, fecha_entrada, fecha_salida,
                cantidad_personas, monto_total, metodo_pago, descuento, estado, observaciones
            ) VALUES (
                :cliente_id, :hospedaje_id, :fecha_entrada, :fecha_salida,
                :cantidad_personas, :monto_total, :metodo_pago, :descuento, :estado, :observaciones
            )
        ");

        $stmt->execute([
            ':cliente_id' => $data['cliente_id'],
            ':hospedaje_id' => $data['hospedaje_id'] ?? null,
            ':fecha_entrada' => $data['fecha_entrada'],
            ':fecha_salida' => $data['fecha_salida'],
            ':cantidad_personas' => $data['cantidad_personas'],
            ':monto_total' => $data['monto_total'],
            ':metodo_pago' => $data['metodo_pago'] ?? 'efectivo',
            ':descuento' => $data['descuento'] ?? 0,
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
            'cantidad_personas', 'monto_total', 'metodo_pago', 'descuento', 'estado', 'observaciones'
        ];

        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "{$field} = :{$field}";
                $params[":{$field}"] = $data[$field];
            }
        }

        if (empty($updates)) {
            // Si no hay cambios, retornar true (no es un error)
            return true;
        }

        $sql = "UPDATE reservas SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        // Retornar true incluso si no hubo cambios (rowCount puede ser 0 si los valores son iguales)
        return true;
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
                (fecha_entrada < :fecha_salida AND DATE_SUB(fecha_salida, INTERVAL 1 DAY) >= :fecha_entrada)
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

    public function getReportesIngresos($filtros = []) {
        try {
            // Obtener pagos reales en lugar de monto_total de reservas
            // Esto muestra lo que realmente se cobró, no lo que se debería cobrar
            $sql = "
                SELECT 
                    p.id as pago_id,
                    p.monto,
                    p.metodo_pago,
                    p.fecha_pago,
                    p.observaciones as pago_observaciones,
                    r.id as reserva_id,
                    r.fecha_entrada,
                    r.fecha_salida,
                    r.monto_total,
                    r.estado,
                    CONCAT(c.nombre, ' ', c.apellido) as nombre_cliente,
                    CASE 
                        WHEN r.hospedaje_id IS NULL THEN 
                            CASE 
                                WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'grupos'
                                ELSE 'camping'
                            END
                        ELSE COALESCE(th.nombre, 'camping')
                    END as tipo_hospedaje
                FROM pagos p
                JOIN reservas r ON p.reserva_id = r.id
                JOIN clientes c ON r.cliente_id = c.id
                LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
                LEFT JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
                WHERE 1=1
            ";

            $params = [];

            // Aplicar filtros de fecha basados en la fecha del pago (no fecha de reserva)
            if (!empty($filtros['fecha_inicio']) && !empty($filtros['fecha_fin'])) {
                $sql .= " AND p.fecha_pago >= :fecha_inicio AND p.fecha_pago <= :fecha_fin";
                $params[':fecha_inicio'] = $filtros['fecha_inicio'];
                $params[':fecha_fin'] = $filtros['fecha_fin'];
            } elseif (!empty($filtros['fecha_inicio'])) {
                $sql .= " AND p.fecha_pago >= :fecha_inicio";
                $params[':fecha_inicio'] = $filtros['fecha_inicio'];
            } elseif (!empty($filtros['fecha_fin'])) {
                $sql .= " AND p.fecha_pago <= :fecha_fin";
                $params[':fecha_fin'] = $filtros['fecha_fin'];
            }

            // Filtrar por método de pago real del pago (no de la reserva)
            if (!empty($filtros['metodo_pago'])) {
                $sql .= " AND p.metodo_pago = :metodo_pago";
                $params[':metodo_pago'] = $filtros['metodo_pago'];
            }

            // Filtrar por tipo de hospedaje de la reserva
            if (!empty($filtros['tipo_hospedaje'])) {
                if ($filtros['tipo_hospedaje'] === 'camping') {
                    $sql .= " AND r.hospedaje_id IS NULL AND (r.observaciones NOT LIKE '%grupo%' AND r.cantidad_personas <= 10)";
                } elseif ($filtros['tipo_hospedaje'] === 'grupos') {
                    $sql .= " AND r.hospedaje_id IS NULL AND (r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10)";
                } else {
                    $sql .= " AND th.nombre = :tipo_hospedaje";
                    $params[':tipo_hospedaje'] = $filtros['tipo_hospedaje'];
                }
            }

            $sql .= " ORDER BY p.fecha_pago DESC, r.fecha_entrada DESC";

            // Ejecutar consulta para obtener pagos
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $pagos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calcular estadísticas basadas en pagos reales
            $estadisticas = $this->calcularEstadisticasPagos($pagos, $filtros);

            // Obtener también reportes por período de reserva
            $reportesPorReserva = $this->getReportesPorPeriodoReserva($filtros);
            $estadisticasPorReserva = $this->calcularEstadisticasPorReserva($reportesPorReserva, $filtros);

            return [
                'reportes' => $pagos,
                'estadisticas' => $estadisticas,
                'reportesPorReserva' => $reportesPorReserva,
                'estadisticasPorReserva' => $estadisticasPorReserva
            ];

        } catch (Exception $e) {
            error_log('Error en getReportesIngresos: ' . $e->getMessage());
            throw new Exception('Error al obtener reportes de ingresos: ' . $e->getMessage());
        }
    }

    /**
     * Obtiene reportes basados en el período de la reserva (fecha_entrada/fecha_salida)
     * en lugar de la fecha de pago. Esto muestra qué reservas corresponden a un período,
     * independientemente de cuándo se pagaron.
     */
    private function getReportesPorPeriodoReserva($filtros = []) {
        try {
            $sql = "
                SELECT 
                    r.id as reserva_id,
                    r.fecha_entrada,
                    r.fecha_salida,
                    r.monto_total,
                    r.estado,
                    CONCAT(c.nombre, ' ', c.apellido) as nombre_cliente,
                    CASE 
                        WHEN r.hospedaje_id IS NULL THEN 
                            CASE 
                                WHEN r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10 THEN 'grupos'
                                ELSE 'camping'
                            END
                        ELSE COALESCE(th.nombre, 'camping')
                    END as tipo_hospedaje,
                    COALESCE(SUM(p.monto), 0) as total_pagado,
                    COUNT(p.id) as cantidad_pagos,
                    COALESCE(GROUP_CONCAT(DISTINCT p.metodo_pago SEPARATOR ', '), '') as metodos_pago
                FROM reservas r
                JOIN clientes c ON r.cliente_id = c.id
                LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
                LEFT JOIN tipos_hospedaje th ON h.tipo_hospedaje_id = th.id
                LEFT JOIN pagos p ON p.reserva_id = r.id
                WHERE 1=1
            ";

            $params = [];

            // Aplicar filtros de fecha basados en la fecha de la reserva (fecha_entrada/fecha_salida)
            if (!empty($filtros['fecha_inicio']) && !empty($filtros['fecha_fin'])) {
                // Reservas que se solapan con el período seleccionado
                $sql .= " AND r.fecha_entrada <= :fecha_fin AND r.fecha_salida >= :fecha_inicio";
                $params[':fecha_inicio'] = $filtros['fecha_inicio'];
                $params[':fecha_fin'] = $filtros['fecha_fin'];
            } elseif (!empty($filtros['fecha_inicio'])) {
                $sql .= " AND r.fecha_salida >= :fecha_inicio";
                $params[':fecha_inicio'] = $filtros['fecha_inicio'];
            } elseif (!empty($filtros['fecha_fin'])) {
                $sql .= " AND r.fecha_entrada <= :fecha_fin";
                $params[':fecha_fin'] = $filtros['fecha_fin'];
            }

            // Filtrar por tipo de hospedaje
            if (!empty($filtros['tipo_hospedaje'])) {
                if ($filtros['tipo_hospedaje'] === 'camping') {
                    $sql .= " AND r.hospedaje_id IS NULL AND (r.observaciones NOT LIKE '%grupo%' AND r.cantidad_personas <= 10)";
                } elseif ($filtros['tipo_hospedaje'] === 'grupos') {
                    $sql .= " AND r.hospedaje_id IS NULL AND (r.observaciones LIKE '%grupo%' OR r.cantidad_personas > 10)";
                } else {
                    $sql .= " AND th.nombre = :tipo_hospedaje";
                    $params[':tipo_hospedaje'] = $filtros['tipo_hospedaje'];
                }
            }

            $sql .= " GROUP BY r.id";
            $sql .= " ORDER BY r.fecha_entrada DESC, r.id DESC";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Filtrar por método de pago si se especifica (a nivel de reserva)
            if (!empty($filtros['metodo_pago']) && $filtros['metodo_pago'] !== 'todos') {
                $reservasFiltradas = [];
                foreach ($reservas as $reserva) {
                    // Si no hay métodos de pago (NULL o vacío), saltar esta reserva cuando se filtra por método
                    if (empty($reserva['metodos_pago'])) {
                        continue;
                    }
                    $metodosPago = explode(', ', $reserva['metodos_pago']);
                    if (in_array($filtros['metodo_pago'], $metodosPago)) {
                        $reservasFiltradas[] = $reserva;
                    }
                }
                return $reservasFiltradas;
            }

            return $reservas;

        } catch (Exception $e) {
            error_log('Error en getReportesPorPeriodoReserva: ' . $e->getMessage());
            throw new Exception('Error al obtener reportes por período de reserva: ' . $e->getMessage());
        }
    }

    private function calcularEstadisticasPorReserva($reservas, $filtros = []) {
        $totalIngresos = 0;
        $totalPagado = 0;
        $totalPendiente = 0;
        $totalReservas = count($reservas);
        $porMetodoPago = [];
        $porTipoHospedaje = [];

        foreach ($reservas as $reserva) {
            $montoTotal = floatval($reserva['monto_total']);
            $montoPagado = floatval($reserva['total_pagado']);
            $montoPendiente = $montoTotal - $montoPagado;

            $totalIngresos += $montoTotal;
            $totalPagado += $montoPagado;
            $totalPendiente += $montoPendiente;

            // Estadísticas por tipo de hospedaje
            $tipoHospedaje = $reserva['tipo_hospedaje'];
            if (!isset($porTipoHospedaje[$tipoHospedaje])) {
                $porTipoHospedaje[$tipoHospedaje] = ['total' => 0, 'pagado' => 0, 'pendiente' => 0, 'cantidad' => 0];
            }
            $porTipoHospedaje[$tipoHospedaje]['total'] += $montoTotal;
            $porTipoHospedaje[$tipoHospedaje]['pagado'] += $montoPagado;
            $porTipoHospedaje[$tipoHospedaje]['pendiente'] += $montoPendiente;
            $porTipoHospedaje[$tipoHospedaje]['cantidad']++;

            // Estadísticas por método de pago (basado en los métodos usados en los pagos)
            if (!empty($reserva['metodos_pago'])) {
                $metodos = explode(', ', $reserva['metodos_pago']);
                foreach ($metodos as $metodo) {
                    $metodo = trim($metodo);
                    if (!isset($porMetodoPago[$metodo])) {
                        $porMetodoPago[$metodo] = ['total' => 0, 'cantidad' => 0];
                    }
                    // Solo contamos el monto pagado con ese método
                    // Para simplificar, dividimos el total pagado entre los métodos
                    $porMetodoPago[$metodo]['total'] += ($montoPagado / count($metodos));
                }
                // Contar reservas únicas por método (una reserva puede tener múltiples métodos)
                foreach (array_unique($metodos) as $metodo) {
                    $metodo = trim($metodo);
                    if (!isset($porMetodoPago[$metodo]['reservas_ids'])) {
                        $porMetodoPago[$metodo]['reservas_ids'] = [];
                    }
                    if (!in_array($reserva['reserva_id'], $porMetodoPago[$metodo]['reservas_ids'])) {
                        $porMetodoPago[$metodo]['reservas_ids'][] = $reserva['reserva_id'];
                        $porMetodoPago[$metodo]['cantidad']++;
                    }
                }
            }
        }

        // Limpiar arrays temporales de reservas_ids
        foreach ($porMetodoPago as $metodo => &$datos) {
            unset($datos['reservas_ids']);
        }

        return [
            'totalIngresos' => $totalIngresos,
            'totalPagado' => $totalPagado,
            'totalPendiente' => $totalPendiente,
            'totalReservas' => $totalReservas,
            'promedioPorReserva' => $totalReservas > 0 ? $totalIngresos / $totalReservas : 0,
            'porMetodoPago' => $porMetodoPago,
            'porTipoHospedaje' => $porTipoHospedaje
        ];
    }

    private function calcularEstadisticasPagos($pagos, $filtros = []) {
        $totalIngresos = 0;
        $totalPagos = count($pagos);
        $reservasUnicas = [];
        $porMetodoPago = [];
        $porTipoHospedaje = [];

        foreach ($pagos as $pago) {
            $monto = floatval($pago['monto']);
            $totalIngresos += $monto;

            // Contar reservas únicas
            $reservaId = $pago['reserva_id'];
            if (!in_array($reservaId, $reservasUnicas)) {
                $reservasUnicas[] = $reservaId;
            }

            // Estadísticas por método de pago real del pago
            $metodoPago = $pago['metodo_pago'];
            if (!isset($porMetodoPago[$metodoPago])) {
                $porMetodoPago[$metodoPago] = ['total' => 0, 'cantidad' => 0];
            }
            $porMetodoPago[$metodoPago]['total'] += $monto;
            $porMetodoPago[$metodoPago]['cantidad']++;

            // Estadísticas por tipo de hospedaje
            $tipoHospedaje = $pago['tipo_hospedaje'];
            if (!isset($porTipoHospedaje[$tipoHospedaje])) {
                $porTipoHospedaje[$tipoHospedaje] = ['total' => 0, 'cantidad' => 0];
            }
            $porTipoHospedaje[$tipoHospedaje]['total'] += $monto;
            $porTipoHospedaje[$tipoHospedaje]['cantidad']++;
        }

        return [
            'totalIngresos' => $totalIngresos,
            'totalReservas' => count($reservasUnicas),
            'totalPagos' => $totalPagos,
            'promedioPorReserva' => count($reservasUnicas) > 0 ? $totalIngresos / count($reservasUnicas) : 0,
            'promedioPorPago' => $totalPagos > 0 ? $totalIngresos / $totalPagos : 0,
            'porMetodoPago' => $porMetodoPago,
            'porTipoHospedaje' => $porTipoHospedaje,
            'totalProporcional' => $totalIngresos // Los pagos ya están filtrados por fecha, así que totalProporcional = totalIngresos
        ];
    }
} 