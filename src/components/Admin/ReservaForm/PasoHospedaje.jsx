import React from 'react';
import './PasoHospedaje.css';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';

const PasoHospedaje = ({
    formData,
    tiposHospedaje = [],
    hospedajes = [],
    disponibilidad,
    tipoHospedajeSeleccionado,
    tipoHospedajeNombre,
    onTipoHospedajeChange,
    onInputChange,
    onNext,
    onBack,
    error
}) => {
    const handleNext = () => {
        if (!formData.hospedaje_id && 
            (tipoHospedajeNombre || '').toLowerCase() !== 'camping' && 
            (tipoHospedajeNombre || '').toLowerCase() !== 'grupos') {
            return;
        }
        onNext();
    };

    return (
        <div className="paso-hospedaje">
            {error && <ErrorMessage message={error} />}
            
            <div className="form-group">
                <label htmlFor="tipo_hospedaje">Tipo de Hospedaje</label>
                <select
                    id="tipo_hospedaje"
                    name="tipo_hospedaje"
                    value={tipoHospedajeSeleccionado}
                    onChange={onTipoHospedajeChange}
                    className="select-input"
                    required
                >
                    <option value="">Selecciona un tipo de hospedaje</option>
                    {Array.isArray(tiposHospedaje) && tiposHospedaje
                        .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                        .map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                                {tipo.nombre}
                            </option>
                        ))}
                </select>
            </div>

            {tipoHospedajeSeleccionado && 
             (tipoHospedajeNombre || '').toLowerCase() !== 'camping' && 
             (tipoHospedajeNombre || '').toLowerCase() !== 'grupos' && (
                <div className="form-group">
                    <label htmlFor="hospedaje_id">Selecciona el hospedaje</label>
                    <select
                        id="hospedaje_id"
                        name="hospedaje_id"
                        value={formData.hospedaje_id}
                        onChange={onInputChange}
                        className="select-input"
                        required
                    >
                        <option value="">Selecciona un hospedaje</option>
                        {Array.isArray(hospedajes) && hospedajes.length > 0 ? (
                            [...hospedajes]
                                .sort((a, b) => a.id - b.id)
                                .map((hospedaje) => (
                                    <option key={hospedaje.id} value={hospedaje.id}>
                                        {hospedaje.numero}
                                    </option>
                                ))
                        ) : (
                            <option value="" disabled>No hay hospedajes disponibles para las fechas seleccionadas</option>
                        )}
                    </select>
                </div>
            )}

            {tipoHospedajeSeleccionado && (tipoHospedajeNombre || '').toLowerCase() === 'grupos' && (
                <div className="info-grupo-especial">
                    <h3>📋 Reserva Especial para Grupos</h3>
                    <p>
                        <strong>Nota importante:</strong> Esta reserva es para grupos grandes y no afecta 
                        la disponibilidad de cabañas, dormis o camping. Es una reserva especial que se 
                        registrará en el calendario para control y seguimiento.
                    </p>
                    <div className="grupo-info">
                        <span>✅ No requiere selección de hospedaje específico</span>
                        <span>✅ Se registra en el calendario</span>
                        <span>✅ Permite control de grupos grandes</span>
                    </div>
                </div>
            )}

            {formData.hospedaje_id && (
                <div className={`disponibilidad-info ${disponibilidad?.disponible ? 'disponible' : 'no-disponible'}`}>
                    <p>{disponibilidad?.mensaje}</p>
                </div>
            )}

            <div className="form-actions">
                <button
                    type="button"
                    className="btn-back"
                    onClick={onBack}
                >
                    Volver
                </button>
                <button
                    type="button"
                    className="btn-next"
                    onClick={handleNext}
                    disabled={!formData.hospedaje_id && 
                              (tipoHospedajeNombre || '').toLowerCase() !== 'camping' && 
                              (tipoHospedajeNombre || '').toLowerCase() !== 'grupos'}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default PasoHospedaje; 