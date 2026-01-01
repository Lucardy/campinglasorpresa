-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS campinglasorpresa;
USE campinglasorpresa;

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apellido VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL,
    modelo_vehiculo VARCHAR(100),
    patente VARCHAR(20),
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tipos de hospedaje
CREATE TABLE IF NOT EXISTS tipos_hospedaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de hospedajes
CREATE TABLE IF NOT EXISTS hospedajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_hospedaje_id INT NOT NULL,
    numero VARCHAR(10) NOT NULL,
    capacidad INT NOT NULL,
    estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_hospedaje_id) REFERENCES tipos_hospedaje(id),
    UNIQUE KEY unique_hospedaje (tipo_hospedaje_id, numero)
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    hospedaje_id INT,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    cantidad_personas INT NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    estado ENUM('activa', 'finalizada', 'cancelada') DEFAULT 'activa',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reserva_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta') NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id)
);

-- Tabla de precios por tipo de hospedaje y cantidad de personas
CREATE TABLE IF NOT EXISTS precios_hospedaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_hospedaje_id INT NOT NULL,
    cantidad_personas INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_hospedaje_id) REFERENCES tipos_hospedaje(id),
    UNIQUE KEY unique_precio_hospedaje (tipo_hospedaje_id, cantidad_personas)
);

-- Insertar tipos de hospedaje
INSERT INTO tipos_hospedaje (nombre, descripcion) VALUES
('cabaña', 'Cabañas con todas las comodidades'),
('dormis', 'Dormitorios compartidos'),
('camping', 'Espacio para carpas');

-- Insertar hospedajes
-- Cabañas
INSERT INTO hospedajes (tipo_hospedaje_id, numero, capacidad) VALUES
(1, '1-CABAÑA', 5),
(1, '2-CABAÑA', 5),
(1, '3-CABAÑA', 5),
(1, '4-CABAÑA', 5),
(1, '5-CABAÑA', 5),
(1, '6-CABAÑA', 5),
(1, '7-CABAÑA', 5),
(1, '8-CABAÑA', 5);

-- Dormis
INSERT INTO hospedajes (tipo_hospedaje_id, numero, capacidad) VALUES
(2, '0-DORMI', 4),
(2, '1-DORMI', 4),
(2, '2-DORMI', 4),
(2, '3-DORMI', 4),
(2, '4-DORMI', 4),
(2, '5-DORMI', 4),
(2, '6-DORMI', 4),
(2, '7-DORMI', 4),
(2, '8-DORMI', 4),
(2, '9-DORMI', 4),
(2, '10-DORMI', 4),
(2, '11-DORMI', 4),
(2, '12-DORMI', 4),
(2, '13-DORMI', 4);


-- Insertar precios para dormis
INSERT INTO precios_hospedaje (tipo_hospedaje_id, cantidad_personas, precio) VALUES
(2, 2, 24000.00),
(2, 3, 34000.00),
(2, 4, 44000.00);

-- Insertar precios para cabañas
INSERT INTO precios_hospedaje (tipo_hospedaje_id, cantidad_personas, precio) VALUES
(1, 2, 46000.00),
(1, 3, 58000.00),
(1, 4, 70000.00),
(1, 5, 70000.00); 