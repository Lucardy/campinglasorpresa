import React from 'react';
import { FaHome } from 'react-icons/fa';

/**
 * Componente para seleccionar tipo de hospedaje y número de hospedaje
 */
const SelectorHospedaje = ({
    tiposHospedaje,
    tipoHospedajeSeleccionado,
    tipoHospedajeNombre,
    handleTipoHospedajeChange,
    hospedajesDisponibles,
    hospedajeSeleccionado,
    handleHospedajeChange,
    loadingHospedajes
}) => {
    const esCamping = tipoHospedajeNombre?.toLowerCase() === 'camping';

    return (
        <div className="form-section">
            <h4><FaHome /> Hospedaje</h4>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="tipo_hospedaje">Tipo de Hospedaje</label>
                    <select
                        id="tipo_hospedaje"
                        value={tipoHospedajeSeleccionado}
                        onChange={handleTipoHospedajeChange}
                        required
                    >
                        <option value="">Seleccione un tipo</option>
                        {tiposHospedaje.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                                {tipo.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                {tipoHospedajeSeleccionado && !esCamping && (
                    <div className="form-group">
                        <label htmlFor="hospedaje_id">Número de Hospedaje</label>
                        {loadingHospedajes ? (
                            <div>Cargando hospedajes...</div>
                        ) : (
                            <select
                                id="hospedaje_id"
                                value={hospedajeSeleccionado}
                                onChange={handleHospedajeChange}
                                required
                            >
                                <option value="">Seleccione un hospedaje</option>
                                {hospedajesDisponibles.map(hospedaje => (
                                    <option key={hospedaje.id} value={hospedaje.id}>
                                        {hospedaje.numero} {hospedaje.tipo_hospedaje_nombre ? `(${hospedaje.tipo_hospedaje_nombre})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectorHospedaje;

