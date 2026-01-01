import React, { useState } from 'react';
import { CLIENTE_FIELDS } from '../../../constants/fields';
import './ClienteForm.css';

const ClienteForm = ({ onClose, onClienteAdded }) => {
    const [formData, setFormData] = useState({
        [CLIENTE_FIELDS.NOMBRE]: '',
        [CLIENTE_FIELDS.APELLIDO]: '',
        [CLIENTE_FIELDS.DOCUMENTO]: '',
        [CLIENTE_FIELDS.TELEFONO]: '',
        [CLIENTE_FIELDS.MODELO_VEHICULO]: '',
        [CLIENTE_FIELDS.PATENTE]: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('🔄 ClienteForm: Enviando datos del cliente...');
            console.log('📝 Datos a enviar:', formData);
            console.log('🔗 Callback onClienteAdded:', onClienteAdded);
            
            await onClienteAdded(formData);
            console.log('✅ ClienteForm: Cliente agregado exitosamente');
            onClose();
        } catch (err) {
            console.error('❌ ClienteForm: Error al agregar cliente:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Nuevo Cliente</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="cliente-form">
                    <div className="form-group">
                        <label htmlFor={CLIENTE_FIELDS.NOMBRE}>Nombre:</label>
                        <input
                            type="text"
                            id={CLIENTE_FIELDS.NOMBRE}
                            name={CLIENTE_FIELDS.NOMBRE}
                            value={formData[CLIENTE_FIELDS.NOMBRE]}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese el nombre"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor={CLIENTE_FIELDS.APELLIDO}>Apellido:</label>
                        <input
                            type="text"
                            id={CLIENTE_FIELDS.APELLIDO}
                            name={CLIENTE_FIELDS.APELLIDO}
                            value={formData[CLIENTE_FIELDS.APELLIDO]}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese el apellido"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor={CLIENTE_FIELDS.DOCUMENTO}>Documento:</label>
                        <input
                            type="text"
                            id={CLIENTE_FIELDS.DOCUMENTO}
                            name={CLIENTE_FIELDS.DOCUMENTO}
                            value={formData[CLIENTE_FIELDS.DOCUMENTO]}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese el número de documento"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor={CLIENTE_FIELDS.TELEFONO}>Teléfono:</label>
                        <input
                            type="tel"
                            id={CLIENTE_FIELDS.TELEFONO}
                            name={CLIENTE_FIELDS.TELEFONO}
                            value={formData[CLIENTE_FIELDS.TELEFONO]}
                            onChange={handleChange}
                            placeholder="Ingrese el número de teléfono"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor={CLIENTE_FIELDS.MODELO_VEHICULO}>Modelo del Vehículo:</label>
                        <input
                            type="text"
                            id={CLIENTE_FIELDS.MODELO_VEHICULO}
                            name={CLIENTE_FIELDS.MODELO_VEHICULO}
                            value={formData[CLIENTE_FIELDS.MODELO_VEHICULO]}
                            onChange={handleChange}
                            placeholder="Ingrese el modelo del vehículo"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor={CLIENTE_FIELDS.PATENTE}>Patente:</label>
                        <input
                            type="text"
                            id={CLIENTE_FIELDS.PATENTE}
                            name={CLIENTE_FIELDS.PATENTE}
                            value={formData[CLIENTE_FIELDS.PATENTE]}
                            onChange={handleChange}
                            placeholder="Ingrese la patente del vehículo"
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClienteForm; 