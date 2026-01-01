import React from 'react';

const AccionesFormulario = ({ 
    loading, 
    limpiarFormulario 
}) => {
    return (
        <div className="form-actions">
            <button
                type="button"
                onClick={limpiarFormulario}
                className="btn-secundario"
                disabled={loading}
            >
                🗑️ Limpiar
            </button>
            <button
                type="submit"
                className="btn-principal"
                disabled={loading}
            >
                {loading ? '⏳ Creando...' : '✅ Crear Reserva'}
            </button>
        </div>
    );
};

export default AccionesFormulario;
