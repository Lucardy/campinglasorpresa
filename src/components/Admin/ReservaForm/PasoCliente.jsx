import React from 'react';
import './PasoCliente.css';

const PasoCliente = ({ 
    searchTerm,
    filteredClientes,
    showResults,
    selectedCliente,
    loading,
    onSearchChange,
    onClienteSelect,
    onBack,
    onSubmit
}) => {
    return (
        <div className="paso-cliente">
            <div className="form-group">
                <label htmlFor="cliente_search">Buscar Cliente *</label>
                <div className="search-container">
                    <input
                        type="text"
                        id="cliente_search"
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder="Buscar por nombre, apellido o documento..."
                        required
                        className="search-input"
                    />
                    {showResults && filteredClientes.length > 0 && (
                        <div className="search-results">
                            {filteredClientes.map(cliente => (
                                <div
                                    key={cliente.id}
                                    className="search-result-item"
                                    onClick={() => onClienteSelect(cliente)}
                                >
                                    <div className="cliente-info">
                                        <strong>{cliente.apellido}, {cliente.nombre}</strong>
                                        <span>Documento: {cliente.documento}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="form-actions">
                <button 
                    type="button" 
                    className="btn-back"
                    onClick={onBack}
                >
                    Volver
                </button>
                <button 
                    type="submit" 
                    className="btn-submit" 
                    onClick={onSubmit}
                    disabled={loading || !selectedCliente}
                >
                    {loading ? 'Guardando...' : 'Guardar Reserva'}
                </button>
            </div>
        </div>
    );
};

export default PasoCliente; 