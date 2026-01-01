# 🔄 Reserva Rápida - Estructura Modular

## 📁 Estructura de Archivos

```
ReservaRapida/
├── README.md                           # Documentación
├── ReservaRapidaRefactorizada.jsx      # Componente principal
├── ReservaRapida.css                   # Estilos compartidos
├── components/                         # Subcomponentes
│   ├── index.js                        # Exportaciones de componentes
│   ├── DatosCliente.jsx                # Formulario de datos del cliente
│   ├── DatosReserva.jsx                # Formulario de datos de la reserva
│   ├── AccionesFormulario.jsx          # Botones de acción
│   └── InfoPanel.jsx                   # Panel de información y consejos
└── hooks/                              # Hooks personalizados
    ├── index.js                        # Exportaciones de hooks
    └── useReservaRapida.js             # Lógica de negocio principal
```

## 🧩 Componentes

### **ReservaRapidaRefactorizada.jsx**
- **Propósito**: Componente principal que orquesta todos los subcomponentes
- **Responsabilidades**: 
  - Renderizar la estructura general
  - Conectar el hook con los componentes
  - Manejar el layout principal

### **DatosCliente.jsx**
- **Propósito**: Formulario para los datos del cliente
- **Props**:
  - `formData`: Datos del formulario
  - `clienteExistente`: Cliente encontrado (si existe)
  - `handleInputChange`: Función para manejar cambios

### **DatosReserva.jsx**
- **Propósito**: Formulario para los datos de la reserva
- **Props**:
  - `formData`: Datos del formulario
  - `tiposHospedaje`: Lista de tipos de hospedaje
  - `hospedajesDisponibles`: Hospedajes disponibles
  - `cantidadesDisponibles`: Cantidades de personas disponibles
  - `verificandoDisponibilidad`: Estado de verificación
  - `calculandoPrecio`: Estado de cálculo de precio
  - `handleInputChange`: Función para manejar cambios
  - `getTipoHospedajeNombre`: Función para obtener nombre del tipo
  - `formatearNumeroHospedaje`: Función para formatear número

### **AccionesFormulario.jsx**
- **Propósito**: Botones de acción del formulario
- **Props**:
  - `loading`: Estado de carga
  - `limpiarFormulario`: Función para limpiar

### **InfoPanel.jsx**
- **Propósito**: Panel de información y consejos de uso
- **Props**: Ninguna (componente estático)

## 🎣 Hooks

### **useReservaRapida.js**
- **Propósito**: Hook personalizado que contiene toda la lógica de negocio
- **Retorna**:
  - **Estados**: `formData`, `tiposHospedaje`, `hospedajesDisponibles`, etc.
  - **Funciones**: `handleInputChange`, `handleSubmit`, `limpiarFormulario`, etc.

## 🔄 Migración

### **Paso 1: Usar la versión refactorizada**
```jsx
// En lugar de:
import ReservaRapida from './ReservaRapida/ReservaRapida';

// Usar:
import ReservaRapidaRefactorizada from './ReservaRapida/ReservaRapidaRefactorizada';
```

### **Paso 2: Verificar funcionalidad**
- ✅ Todos los campos funcionan igual
- ✅ Validaciones se mantienen
- ✅ Cálculo automático de precios
- ✅ Verificación de disponibilidad
- ✅ Cantidades adaptativas

### **Paso 3: Eliminar versión legacy (opcional)**
Una vez confirmado que todo funciona, se puede eliminar `ReservaRapida.jsx`

## 🎯 Beneficios de la Refactorización

### **1. Mantenibilidad**
- ✅ Código más fácil de leer y entender
- ✅ Responsabilidades bien definidas
- ✅ Fácil localización de bugs

### **2. Reutilización**
- ✅ Componentes pueden reutilizarse
- ✅ Hook puede usarse en otros componentes
- ✅ Lógica separada de la presentación

### **3. Testing**
- ✅ Cada componente puede testearse independientemente
- ✅ Hook puede testearse por separado
- ✅ Mocks más fáciles de implementar

### **4. Escalabilidad**
- ✅ Fácil agregar nuevas funcionalidades
- ✅ Modificaciones aisladas
- ✅ Menos conflictos en desarrollo en equipo

## 🚀 Uso

```jsx
import React from 'react';
import ReservaRapidaRefactorizada from './components/Admin/ReservaRapida/ReservaRapidaRefactorizada';

const AdminPanel = () => {
    return (
        <div>
            <ReservaRapidaRefactorizada />
        </div>
    );
};
```

## 🔧 Desarrollo

### **Agregar nuevo campo al cliente**
1. Modificar `useReservaRapida.js` - agregar al estado `formData`
2. Modificar `DatosCliente.jsx` - agregar el input
3. Actualizar validaciones si es necesario

### **Agregar nueva funcionalidad**
1. Crear nuevo componente en `components/`
2. Agregar lógica al hook `useReservaRapida.js`
3. Importar y usar en `ReservaRapidaRefactorizada.jsx`

### **Modificar estilos**
- Todos los estilos están en `ReservaRapida.css`
- Los componentes usan las mismas clases CSS
- No se requieren cambios en la estructura
