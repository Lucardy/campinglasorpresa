# 📊 Reportes de Ingresos - Estructura Modular

## 📁 Estructura de Archivos

```
ReportesIngresos/
├── README.md                           # Documentación
├── ReportesIngresos.jsx                # Componente principal
├── ReportesIngresos.css                # Estilos compartidos
├── components/                         # Subcomponentes
│   ├── index.js                        # Exportaciones de componentes
│   ├── FiltrosReportes.jsx             # Componente de filtros
│   ├── EstadisticaCard.jsx             # Tarjeta de estadística individual
│   ├── DesgloseEstadisticas.jsx        # Desglose por método de pago/tipo hospedaje
│   ├── TablaPagos.jsx                  # Tabla de pagos recibidos
│   ├── TablaReservas.jsx               # Tabla de reservas del período
│   └── SeccionReporte.jsx              # Wrapper para secciones de reporte
├── hooks/                              # Hooks personalizados
│   ├── index.js                        # Exportaciones de hooks
│   └── useReportesIngresos.js          # Lógica de negocio principal
└── utils/                                # Utilidades reutilizables
    ├── index.js                        # Exportaciones de utilidades
    ├── formatters.js                   # Funciones de formateo (precio, fecha)
    ├── iconos.js                       # Funciones para obtener iconos
    └── calculos.js                     # Funciones de cálculo (noches, proporcional)
```

## 🧩 Componentes

### **ReportesIngresos.jsx**
- **Propósito**: Componente principal que orquesta todos los subcomponentes
- **Responsabilidades**: 
  - Renderizar la estructura general
  - Conectar el hook con los componentes
  - Manejar el layout principal

### **FiltrosReportes.jsx**
- **Propósito**: Componente de filtros para los reportes
- **Props**:
  - `filtros`: Objeto con los filtros actuales
  - `mesSeleccionado`: Mes seleccionado en el selector
  - `onFiltroChange`: Función para manejar cambios en filtros
  - `onMesChange`: Función para manejar cambio de mes
  - `onLimpiar`: Función para limpiar filtros
  - `onExportar`: Función para exportar reporte

### **EstadisticaCard.jsx**
- **Propósito**: Tarjeta individual para mostrar una estadística
- **Props**:
  - `icono`: Icono a mostrar
  - `titulo`: Título de la estadística
  - `valor`: Valor a mostrar
  - `variante`: Variante de estilo (opcional)

### **DesgloseEstadisticas.jsx**
- **Propósito**: Muestra desglose de estadísticas por método de pago o tipo de hospedaje
- **Props**:
  - `tipo`: 'metodoPago' o 'tipoHospedaje'
  - `datos`: Objeto con los datos del desglose
  - `mostrarDetalle`: Boolean para mostrar detalles adicionales (pagado/pendiente)

### **TablaPagos.jsx**
- **Propósito**: Tabla que muestra los pagos recibidos
- **Props**:
  - `reportes`: Array de pagos a mostrar

### **TablaReservas.jsx**
- **Propósito**: Tabla que muestra las reservas del período
- **Props**:
  - `reportesPorReserva`: Array de reservas a mostrar

### **SeccionReporte.jsx**
- **Propósito**: Wrapper para las secciones de reporte (Cash Flow y Período de Reserva)
- **Props**:
  - `titulo`: Título de la sección
  - `icono`: Icono de la sección
  - `descripcion`: Descripción de la sección
  - `variante`: Clase CSS para variante de estilo
  - `children`: Contenido de la sección

## 🎣 Hooks

### **useReportesIngresos.js**
- **Propósito**: Hook personalizado que contiene toda la lógica de negocio
- **Retorna**:
  - Estados: `reportes`, `reportesPorReserva`, `loading`, `filtros`, `mesSeleccionado`, `estadisticas`, `estadisticasPorReserva`
  - Acciones: `handleFiltroChange`, `handleMesChange`, `limpiarFiltros`, `exportarReporte`

## 🛠️ Utilidades

### **formatters.js**
- `formatearPrecio(precio)`: Formatea un precio a formato de moneda argentina
- `formatearFecha(fecha)`: Formatea una fecha a formato local argentino

### **iconos.js**
- `getIconoTipoHospedaje(tipo)`: Retorna el icono correspondiente al tipo de hospedaje
- `getIconoMetodoPago(metodo)`: Retorna el icono correspondiente al método de pago

### **calculos.js**
- `calcularNoches(desde, hastaExclusiva)`: Calcula el número de noches entre dos fechas
- `calcularProporcionalReserva(reserva, rangoInicio, rangoFin)`: Calcula el monto proporcional de una reserva
- `calcularTotalProporcional(lista, inicio, fin)`: Calcula el total proporcional de una lista de reservas

## 📝 Uso

```jsx
import ReportesIngresos from './ReportesIngresos/ReportesIngresos';

// En tu componente
<ReportesIngresos />
```

## 🔄 Flujo de Datos

1. El componente principal `ReportesIngresos` usa el hook `useReportesIngresos`
2. El hook maneja toda la lógica de estado y llamadas a la API
3. Los datos se pasan a los componentes hijos como props
4. Los componentes hijos son puramente presentacionales
5. Las utilidades se usan en los componentes para formatear y calcular

## ✨ Beneficios de esta Estructura

- **Separación de responsabilidades**: Lógica separada de presentación
- **Reutilización**: Componentes y utilidades pueden reutilizarse
- **Mantenibilidad**: Código más fácil de entender y modificar
- **Testabilidad**: Componentes y funciones más fáciles de testear
- **Escalabilidad**: Fácil agregar nuevas funcionalidades

