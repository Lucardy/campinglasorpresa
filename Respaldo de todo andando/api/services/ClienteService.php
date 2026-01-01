<?php
require_once __DIR__ . '/../models/Cliente.php';

class ClienteService {
    private $clienteModel;

    public function __construct($pdo) {
        $this->clienteModel = new Cliente($pdo);
    }

    public function buscarClientes($searchTerm = null) {
        if ($searchTerm) {
            return $this->clienteModel->search($searchTerm);
        }
        return $this->clienteModel->findAll();
    }

    public function obtenerCliente($id) {
        $cliente = $this->clienteModel->findById($id);
        if (!$cliente) {
            throw new Exception('Cliente no encontrado');
        }
        return $cliente;
    }

    public function crearCliente($data) {
        // Validar campos requeridos
        $requiredFields = ['apellido', 'nombre', 'documento'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("El campo {$field} es requerido");
            }
        }

        // Validar formato del documento (solo que sean números)
        if (!preg_match('/^\d+$/', $data['documento'])) {
            throw new Exception('El documento debe contener solo números');
        }

        // Verificar si el documento ya existe
        $clienteExistente = $this->clienteModel->findByDocumento($data['documento']);
        if ($clienteExistente) {
            throw new Exception('Ya existe un cliente con ese documento');
        }

        // Validar email si se proporciona
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('El formato del email no es válido');
        }

        // Validar teléfono si se proporciona (solo que sean números)
        if (!empty($data['telefono']) && !preg_match('/^\d+$/', $data['telefono'])) {
            throw new Exception('El teléfono debe contener solo números');
        }

        // Validar fecha de nacimiento si se proporciona
        if (!empty($data['fecha_nacimiento'])) {
            $fechaNacimiento = new DateTime($data['fecha_nacimiento']);
            $hoy = new DateTime();
            if ($fechaNacimiento > $hoy) {
                throw new Exception('La fecha de nacimiento no puede ser futura');
            }
        }

        // Crear el cliente
        return $this->clienteModel->create($data);
    }

    public function actualizarCliente($id, $data) {
        // Verificar que el cliente existe
        $cliente = $this->clienteModel->findById($id);
        if (!$cliente) {
            throw new Exception('Cliente no encontrado');
        }

        // Validar documento si se está actualizando
        if (isset($data['documento'])) {
            if (!preg_match('/^\d+$/', $data['documento'])) {
                throw new Exception('El documento debe contener solo números');
            }

            // Verificar si el documento ya existe en otro cliente
            $clienteExistente = $this->clienteModel->findByDocumento($data['documento']);
            if ($clienteExistente && $clienteExistente['id'] != $id) {
                throw new Exception('Ya existe otro cliente con ese documento');
            }
        }

        // Validar email si se está actualizando
        if (isset($data['email']) && !empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('El formato del email no es válido');
        }

        // Validar teléfono si se está actualizando
        if (isset($data['telefono']) && !empty($data['telefono']) && !preg_match('/^\d+$/', $data['telefono'])) {
            throw new Exception('El teléfono debe contener solo números');
        }

        // Validar fecha de nacimiento si se está actualizando
        if (isset($data['fecha_nacimiento']) && !empty($data['fecha_nacimiento'])) {
            $fechaNacimiento = new DateTime($data['fecha_nacimiento']);
            $hoy = new DateTime();
            if ($fechaNacimiento > $hoy) {
                throw new Exception('La fecha de nacimiento no puede ser futura');
            }
        }

        // Actualizar el cliente
        $success = $this->clienteModel->update($id, $data);
        if (!$success) {
            throw new Exception('Error al actualizar el cliente');
        }

        return true;
    }

    public function eliminarCliente($id) {
        // Verificar que el cliente existe
        $cliente = $this->clienteModel->findById($id);
        if (!$cliente) {
            throw new Exception('Cliente no encontrado');
        }

        // Eliminar el cliente
        return $this->clienteModel->delete($id);
    }
} 