# 🏨 Nueva Lógica de Disponibilidad - Reservas Consecutivas

## 📋 Problema Identificado

**Problema anterior:**
- Una reserva del 20 al 25 ocupaba: 20, 21, 22, 23, 24, **25**
- No se podía hacer una reserva del 25 al 29 porque el 25 estaba "ocupado"
- Los huéspedes se van el 25 por la mañana, pero el sistema no permitía nuevos huéspedes ese mismo día

## ✅ Solución Implementada

**Nueva lógica:**
- Una reserva del 20 al 25 ocupa: 20, 21, 22, 23, 24
- El día 25 queda **disponible** para nuevos huéspedes
- Se pueden hacer reservas consecutivas: 20-25 y 25-29

## 🔧 Cambios Técnicos Realizados

### Archivos Modificados:

#### 1. `api/models/Hospedaje.php` - Función `checkDisponibilidad()`

**Antes:**
```sql
(r.fecha_entrada <= :fecha_salida AND r.fecha_salida >= :fecha_entrada)
```

**Ahora:**
```sql
(r.fecha_entrada < :fecha_salida AND DATE_SUB(r.fecha_salida, INTERVAL 1 DAY) >= :fecha_entrada)
```

#### 2. `api/models/Reserva.php` - Función `checkAvailability()`

**Antes:**
```sql
(fecha_entrada BETWEEN :fecha_entrada AND :fecha_salida)
OR (fecha_salida BETWEEN :fecha_entrada AND :fecha_salida)
OR (:fecha_entrada BETWEEN fecha_entrada AND fecha_salida)
```

**Ahora:**
```sql
(fecha_entrada < :fecha_salida AND DATE_SUB(fecha_salida, INTERVAL 1 DAY) >= :fecha_entrada)
```

### Explicación de la Nueva Consulta:

1. **`r.fecha_entrada < :fecha_salida`**: La fecha de entrada de la reserva existente debe ser anterior a la fecha de salida de la nueva reserva
2. **`DATE_SUB(r.fecha_salida, INTERVAL 1 DAY) >= :fecha_entrada`**: El día anterior a la salida de la reserva existente debe ser mayor o igual a la fecha de entrada de la nueva reserva

## 📊 Ejemplos Prácticos

### Escenario 1: Reservas Consecutivas ✅
```
Reserva A: 20 enero - 25 enero
Ocupa: 20, 21, 22, 23, 24
Día 25: DISPONIBLE

Reserva B: 25 enero - 29 enero
Ocupa: 25, 26, 27, 28
✅ PERMITIDO - No hay conflicto
```

### Escenario 2: Reservas Superpuestas ❌
```
Reserva A: 20 enero - 25 enero
Ocupa: 20, 21, 22, 23, 24

Reserva B: 22 enero - 26 enero
Ocupa: 22, 23, 24, 25
❌ BLOQUEADO - Conflicto en días 22, 23, 24
```

### Escenario 3: Reservas Adyacentes ✅
```
Reserva A: 20 enero - 25 enero
Ocupa: 20, 21, 22, 23, 24

Reserva B: 25 enero - 29 enero
Ocupa: 25, 26, 27, 28
✅ PERMITIDO - No hay conflicto
```

## 🧪 Cómo Probar

1. **Abrir el archivo de test:** `test_disponibilidad_consecutiva.html`
2. **Ejecutar el test** para verificar que funciona correctamente
3. **Crear reservas de prueba** en el sistema:
   - Reserva 1: 20 enero - 25 enero
   - Reserva 2: 25 enero - 29 enero (debe ser posible)

## 🎯 Beneficios

1. **Mayor ocupación**: Se pueden hacer reservas consecutivas
2. **Mejor gestión**: Los huéspedes pueden salir y entrar el mismo día
3. **Lógica realista**: Refleja cómo funciona realmente el hospedaje
4. **Sin cambios en la interfaz**: Los usuarios no notan diferencia, solo funciona mejor

## ⚠️ Consideraciones

- **Backup**: Se recomienda hacer backup antes de aplicar en producción
- **Testing**: Probar exhaustivamente con diferentes escenarios
- **Monitoreo**: Verificar que no se creen reservas superpuestas por error

## 🔄 Reversión (si es necesario)

Si necesitas revertir los cambios, simplemente cambia las consultas SQL de vuelta a:

```sql
(r.fecha_entrada <= :fecha_salida AND r.fecha_salida >= :fecha_entrada)
```

---

**Fecha de implementación:** $(date)
**Archivos modificados:** 
- `api/models/Hospedaje.php` (función `checkDisponibilidad`)
- `api/models/Reserva.php` (función `checkAvailability`)
**Estado:** ✅ Implementado y listo para pruebas
