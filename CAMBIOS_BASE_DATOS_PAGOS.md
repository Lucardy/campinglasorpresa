# Cambios en Base de Datos para Sistema de Pagos

## 1. Agregar campo `estado_pago` a la tabla `reservas`

Ejecuta este SQL en tu base de datos:

```sql
-- Agregar columna estado_pago a la tabla reservas
ALTER TABLE reservas 
ADD COLUMN estado_pago ENUM('pendiente', 'parcial', 'completo') DEFAULT 'pendiente' 
AFTER estado;

-- Actualizar estado_pago basado en pagos existentes (si ya hay datos)
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
```

## 2. Agregar campo `observaciones` a la tabla `pagos` (opcional, para notas)

```sql
-- Agregar campo observaciones a la tabla pagos (opcional)
ALTER TABLE pagos 
ADD COLUMN observaciones TEXT NULL 
AFTER fecha_pago;
```

## 3. Verificar estructura final

Después de ejecutar los cambios, verifica que las tablas tengan esta estructura:

### Tabla `reservas`:
- Debe tener el campo `estado_pago` ENUM('pendiente', 'parcial', 'completo')

### Tabla `pagos`:
- `id` (AUTO_INCREMENT PRIMARY KEY)
- `reserva_id` (INT, FOREIGN KEY)
- `monto` (DECIMAL(10,2))
- `metodo_pago` (ENUM('efectivo', 'transferencia', 'tarjeta'))
- `fecha_pago` (TIMESTAMP)
- `observaciones` (TEXT, opcional)

## Notas importantes:

1. **Migración de datos existentes**: Si ya tienes reservas con el campo `descuento` usado como seña, necesitarás migrar esos datos a la tabla `pagos`. Te daré un script SQL para eso después de que confirmes que quieres hacerlo.

2. **El campo `descuento`**: Por ahora lo dejamos como está, pero en el futuro podríamos usarlo solo para descuentos reales y usar `pagos` para todas las señas y pagos.

3. **Backward compatibility**: El código actual seguirá funcionando, solo agregaremos funcionalidad nueva.

