-- ============================================
-- CAMBIOS EN BASE DE DATOS PARA SISTEMA DE PAGOS
-- ============================================
-- Ejecuta este script completo en tu base de datos MySQL
-- Base de datos: campinglasorpresa
-- ============================================

-- 1. Agregar columna estado_pago a la tabla reservas
ALTER TABLE reservas 
ADD COLUMN estado_pago ENUM('pendiente', 'parcial', 'completo') DEFAULT 'pendiente' 
AFTER estado;

-- 2. Actualizar estado_pago basado en pagos existentes (si ya hay datos)
UPDATE reservas r
LEFT JOIN (
    SELECT reserva_id, SUM(monto) as total_pagado
    FROM pagos
    GROUP BY reserva_id
) p ON r.id = p.reserva_id
SET r.estado_pago = CASE
    WHEN COALESCE(p.total_pagado, 0) = 0 THEN 'pendiente'
    WHEN COALESCE(p.total_pagado, 0) >= r.monto_total THEN 'completo'
    ELSE 'parcial'
END;

-- 3. Agregar campo observaciones a la tabla pagos (opcional, para notas)
ALTER TABLE pagos 
ADD COLUMN observaciones TEXT NULL 
AFTER fecha_pago;

-- ============================================
-- VERIFICACIÓN (opcional - puedes ejecutar esto para verificar)
-- ============================================
-- Ver estructura de la tabla reservas
-- DESCRIBE reservas;

-- Ver estructura de la tabla pagos
-- DESCRIBE pagos;

-- Ver reservas con su estado de pago
-- SELECT id, monto_total, estado_pago, 
--        (SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE reserva_id = reservas.id) as total_pagado
-- FROM reservas
-- LIMIT 10;

