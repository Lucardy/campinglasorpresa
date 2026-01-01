import React from 'react';

const DatosCliente = ({ 
    formData, 
    clienteExistente, 
    handleInputChange 
}) => {
    return (
        <div className="form-section">
            <h3>👤 Datos del Cliente</h3>
            <div className="form-row">
                <div className="form-group">
                    <label>Documento *</label>
                    <input
                        type="text"
                        name="documento"
                        value={formData.documento}
                        onChange={handleInputChange}
                        placeholder="DNI/Pasaporte"
                        required
                    />
                    {clienteExistente && (
                        <div className="cliente-existente">
                            ✓ Cliente existente: {clienteExistente.nombre} {clienteExistente.apellido}
                        </div>
                    )}
                </div>
                <div className="form-group">
                    <label>Nombre *</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Nombre"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Apellido *</label>
                    <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        placeholder="Apellido"
                        required
                    />
                </div>
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Teléfono *</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="Teléfono"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Modelo Vehículo</label>
                    <input
                        type="text"
                        name="modelo_vehiculo"
                        value={formData.modelo_vehiculo}
                        onChange={handleInputChange}
                        placeholder="Modelo del vehículo"
                    />
                </div>
                <div className="form-group">
                    <label>Patente</label>
                    <input
                        type="text"
                        name="patente"
                        value={formData.patente}
                        onChange={handleInputChange}
                        placeholder="Patente"
                    />
                </div>
            </div>
        </div>
    );
};

export default DatosCliente;
