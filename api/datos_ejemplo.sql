-- Insertar datos de ejemplo en la tabla clientes
INSERT INTO clientes (apellido, nombre, documento, modelo_vehiculo, patente, telefono) VALUES
('González', 'Juan', '12345678', 'Toyota Hilux', 'ABC123', '1234567890'),
('Martínez', 'María', '23456789', 'Volkswagen Gol', 'DEF456', '2345678901'),
('Rodríguez', 'Carlos', '34567890', 'Ford Ranger', 'GHI789', '3456789012'),
('López', 'Ana', '45678901', 'Chevrolet Onix', 'JKL012', '4567890123'),
('Pérez', 'Pedro', '56789012', 'Fiat Cronos', 'MNO345', '5678901234'),
('Sánchez', 'Laura', '67890123', 'Renault Kwid', 'PQR678', '6789012345'),
('Fernández', 'Diego', '78901234', 'Peugeot 208', 'STU901', '7890123456'),
('García', 'Sofía', '89012345', 'Citroën C4', 'VWX234', '8901234567');

-- Insertar datos de ejemplo en la tabla reservas
INSERT INTO reservas (cliente_id, hospedaje_id, fecha_entrada, fecha_salida, cantidad_personas, monto_total, estado, observaciones) VALUES
(1, 1, '2025-06-20', '2025-06-25', 4, 75000.00, 'activa', 'Llegada tarde'),
(2, 3, '2025-06-21', '2025-06-23', 6, 40000.00, 'activa', 'Solicita desayuno'),
(3, 5, '2025-06-22', '2025-06-27', 8, 125000.00, 'activa', 'Traen mascotas'),
(4, 2, '2025-06-23', '2025-06-26', 4, 45000.00, 'activa', 'Solicita cuna'),
(5, 4, '2025-06-24', '2025-06-28', 6, 80000.00, 'activa', 'Llegada temprano'),
(6, 6, '2025-06-25', '2025-06-30', 8, 125000.00, 'activa', 'Traen kayak'),
(7, 7, '2025-06-26', '2025-06-29', 10, 90000.00, 'activa', 'Solicitan asador'),
(8, 8, '2025-06-27', '2025-06-31', 10, 120000.00, 'activa', 'Traen bicicletas');

-- Insertar datos de ejemplo en la tabla pagos
INSERT INTO pagos (reserva_id, monto, metodo_pago, fecha_pago) VALUES
(1, 25000.00, 'efectivo', '2025-06-15 10:00:00'),
(1, 25000.00, 'transferencia', '2025-06-18 15:30:00'),
(2, 20000.00, 'tarjeta', '2025-06-16 11:20:00'),
(3, 40000.00, 'transferencia', '2025-06-17 09:45:00'),
(4, 15000.00, 'efectivo', '2025-06-18 14:15:00'),
(5, 30000.00, 'tarjeta', '2025-06-19 16:00:00'),
(6, 40000.00, 'transferencia', '2025-06-20 10:30:00'),
(7, 30000.00, 'efectivo', '2025-06-21 11:45:00'),
(8, 40000.00, 'tarjeta', '2025-06-22 13:20:00'); 