<?php
require_once __DIR__ . '/../models/Hospedaje.php';
require_once __DIR__ . '/../models/PrecioHospedaje.php';

class HospedajeService {
    private $hospedajeModel;
    private $precioHospedajeModel;

    public function __construct($pdo) {
        $this->hospedajeModel = new Hospedaje($pdo);
        $this->precioHospedajeModel = new PrecioHospedaje($pdo);
    }

    public function buscarHospedajes($searchTerm = null) {
        if ($searchTerm) {
            return $this->hospedajeModel->search($searchTerm);
        }
        return $this->hospedajeModel->findAll();
    }

    public function obtenerHospedaje($id) {
        $hospedaje = $this->hospedajeModel->findById($id);
        if (!$hospedaje) {
            throw new Exception('Hospedaje no encontrado');
        }
        return $hospedaje;
    }

    public function crearHospedaje($data) {
        // Validar campos requeridos
        $requiredFields = ['numero', 'tipo_hospedaje_id', 'capacidad'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("El campo {$field} es requerido");
            }
        }

        // Validar número único
        $hospedajeExistente = $this->hospedajeModel->findByNumero($data['numero']);
        if ($hospedajeExistente) {
            throw new Exception('Ya existe un hospedaje con ese número');
        }

        // Validar capacidad
        if (!is_numeric($data['capacidad']) || $data['capacidad'] <= 0) {
            throw new Exception('La capacidad debe ser un número positivo');
        }

        // Validar precio base si se proporciona
        if (isset($data['precio_base']) && (!is_numeric($data['precio_base']) || $data['precio_base'] < 0)) {
            throw new Exception('El precio base debe ser un número no negativo');
        }

        // Validar estado si se proporciona
        $estadosValidos = ['activo', 'inactivo', 'mantenimiento'];
        if (isset($data['estado']) && !in_array($data['estado'], $estadosValidos)) {
            throw new Exception('Estado no válido');
        }

        // Crear el hospedaje
        return $this->hospedajeModel->create($data);
    }

    public function actualizarHospedaje($id, $data) {
        // Verificar que el hospedaje existe
        $hospedaje = $this->hospedajeModel->findById($id);
        if (!$hospedaje) {
            throw new Exception('Hospedaje no encontrado');
        }

        // Validar número si se está actualizando
        if (isset($data['numero'])) {
            $hospedajeExistente = $this->hospedajeModel->findByNumero($data['numero']);
            if ($hospedajeExistente && $hospedajeExistente['id'] != $id) {
                throw new Exception('Ya existe otro hospedaje con ese número');
            }
        }

        // Validar capacidad si se está actualizando
        if (isset($data['capacidad']) && (!is_numeric($data['capacidad']) || $data['capacidad'] <= 0)) {
            throw new Exception('La capacidad debe ser un número positivo');
        }

        // Validar precio base si se está actualizando
        if (isset($data['precio_base']) && (!is_numeric($data['precio_base']) || $data['precio_base'] < 0)) {
            throw new Exception('El precio base debe ser un número no negativo');
        }

        // Validar estado si se está actualizando
        $estadosValidos = ['activo', 'inactivo', 'mantenimiento'];
        if (isset($data['estado']) && !in_array($data['estado'], $estadosValidos)) {
            throw new Exception('Estado no válido');
        }

        // Actualizar el hospedaje
        $success = $this->hospedajeModel->update($id, $data);
        if (!$success) {
            throw new Exception('Error al actualizar el hospedaje');
        }

        return true;
    }

    public function eliminarHospedaje($id) {
        // Verificar que el hospedaje existe
        $hospedaje = $this->hospedajeModel->findById($id);
        if (!$hospedaje) {
            throw new Exception('Hospedaje no encontrado');
        }

        // Eliminar el hospedaje
        return $this->hospedajeModel->delete($id);
    }

    public function obtenerTiposHospedaje() {
        return $this->hospedajeModel->getTiposHospedaje();
    }

    public function getTiposHospedaje() {
        try {
            return $this->hospedajeModel->getTiposHospedaje();
        } catch (Exception $e) {
            error_log('Error en getTiposHospedaje: ' . $e->getMessage());
            throw new Exception('Error al obtener tipos de hospedaje');
        }
    }

    public function getAllHospedajes() {
        try {
            return $this->hospedajeModel->findAll();
        } catch (Exception $e) {
            error_log('Error en getAllHospedajes: ' . $e->getMessage());
            throw new Exception('Error al obtener hospedajes');
        }
    }

    public function verificarDisponibilidad($hospedajeId, $fechaEntrada, $fechaSalida) {
        try {
            error_log("Verificando disponibilidad para hospedaje: " . $hospedajeId . " en fechas: " . $fechaEntrada . " - " . $fechaSalida);
            
            // Validar que el hospedaje existe
            $hospedaje = $this->hospedajeModel->getById($hospedajeId);
            if (!$hospedaje) {
                throw new Exception('El hospedaje no existe');
            }

            // Validar fechas
            if (empty($fechaEntrada) || empty($fechaSalida)) {
                throw new Exception('Las fechas son requeridas');
            }

            // Validar formato de fechas
            try {
                $fechaEntradaObj = new DateTime($fechaEntrada);
                $fechaSalidaObj = new DateTime($fechaSalida);
                
                // Validar que las fechas tengan formato válido
                if (!$fechaEntradaObj || !$fechaSalidaObj) {
                    throw new Exception('Formato de fecha inválido');
                }
            } catch (Exception $e) {
                throw new Exception('Formato de fecha inválido: ' . $e->getMessage());
            }
            
            if ($fechaEntradaObj >= $fechaSalidaObj) {
                throw new Exception('La fecha de entrada debe ser anterior a la fecha de salida');
            }

            // Verificar disponibilidad
            $disponible = $this->hospedajeModel->checkDisponibilidad($hospedajeId, $fechaEntrada, $fechaSalida);
            error_log("Resultado de disponibilidad: " . ($disponible ? 'true' : 'false'));

            return $disponible;
        } catch (Exception $e) {
            error_log('Error en verificarDisponibilidad: ' . $e->getMessage());
            throw new Exception('Error al verificar disponibilidad: ' . $e->getMessage());
        }
    }

    public function obtenerHospedajesDisponibles($fechaEntrada, $fechaSalida, $tipoHospedajeId) {
        try {
            error_log("Iniciando obtenerHospedajesDisponibles con parámetros: " . json_encode([
                'fechaEntrada' => $fechaEntrada,
                'fechaSalida' => $fechaSalida,
                'tipoHospedajeId' => $tipoHospedajeId
            ]));

            // Validar tipo de hospedaje
            if (empty($tipoHospedajeId)) {
                throw new Exception('El ID del tipo de hospedaje es requerido');
            }

            // Verificar que el tipo de hospedaje existe
            $tipoHospedaje = $this->hospedajeModel->getTipoHospedaje($tipoHospedajeId);
            if (!$tipoHospedaje) {
                throw new Exception('El tipo de hospedaje no existe');
            }

            // Validar fechas
            if (empty($fechaEntrada) || empty($fechaSalida)) {
                throw new Exception('Las fechas son requeridas');
            }

            // Validar formato de fechas
            try {
                $fechaEntradaObj = new DateTime($fechaEntrada);
                $fechaSalidaObj = new DateTime($fechaSalida);
                
                // Validar que la fecha de entrada sea anterior a la fecha de salida
                if ($fechaEntradaObj >= $fechaSalidaObj) {
                    throw new Exception('La fecha de entrada debe ser anterior a la fecha de salida');
                }
                
                // Nota: No validamos la fecha mínima aquí porque esta función se usa tanto para
                // crear nuevas reservas como para editar reservas existentes. La validación de
                // fecha mínima se debe hacer en el momento de crear/actualizar la reserva, no aquí.
            } catch (Exception $e) {
                // Si el error es sobre formato de fecha, lanzarlo con mensaje claro
                if (strpos($e->getMessage(), 'fecha de entrada debe ser anterior') !== false) {
                    throw $e;
                }
                throw new Exception('Formato de fecha inválido: ' . $e->getMessage());
            }

            // Obtener hospedajes disponibles
            $hospedajes = $this->hospedajeModel->getHospedajesDisponibles(
                $fechaEntrada,
                $fechaSalida,
                $tipoHospedajeId
            );

            error_log("Hospedajes encontrados: " . json_encode($hospedajes));

            if (!is_array($hospedajes)) {
                throw new Exception('Error al obtener los hospedajes disponibles');
            }

            return $hospedajes;
        } catch (Exception $e) {
            error_log('Error en HospedajeService::obtenerHospedajesDisponibles: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getPrecioHospedaje($tipoHospedajeId, $cantidadPersonas, $metodoPago = 'efectivo') {
        try {
            // Obtener el precio de la tabla precios_hospedaje
            $precio = $this->precioHospedajeModel->getPrecio($tipoHospedajeId, $cantidadPersonas, $metodoPago);
            
            if ($precio === null) {
                throw new Exception('No se encontró un precio para la combinación de tipo de hospedaje, cantidad de personas y método de pago especificada');
            }

            return $precio;
        } catch (Exception $e) {
            error_log('Error en getPrecioHospedaje: ' . $e->getMessage());
            throw new Exception('Error al obtener el precio del hospedaje: ' . $e->getMessage());
        }
    }

    public function getAllPrecios() {
        try {
            return $this->precioHospedajeModel->getAllPrecios();
        } catch (Exception $e) {
            error_log('Error en getAllPrecios: ' . $e->getMessage());
            throw new Exception('Error al obtener los precios: ' . $e->getMessage());
        }
    }

    public function getCantidadesPersonasDisponibles($tipoHospedajeId) {
        try {
            return $this->hospedajeModel->getCantidadesPersonasDisponibles($tipoHospedajeId);
        } catch (Exception $e) {
            error_log('Error en getCantidadesPersonasDisponibles: ' . $e->getMessage());
            throw new Exception('Error al obtener las cantidades de personas disponibles: ' . $e->getMessage());
        }
    }

    public function actualizarPrecio($id, $precio) {
        try {
            // Validar que el precio sea válido
            if (!is_numeric($precio) || $precio < 0) {
                throw new Exception('El precio debe ser un número válido mayor o igual a 0');
            }

            // Actualizar el precio usando el modelo
            $success = $this->precioHospedajeModel->update($id, ['precio' => $precio]);
            
            if (!$success) {
                throw new Exception('Error al actualizar el precio');
            }

            return true;
        } catch (Exception $e) {
            error_log('Error en actualizarPrecio: ' . $e->getMessage());
            throw new Exception('Error al actualizar el precio: ' . $e->getMessage());
        }
    }
} 