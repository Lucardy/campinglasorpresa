import React from 'react';
import { FaFilter, FaDownload } from 'react-icons/fa';

const FiltrosReportes = ({ filtros, mesSeleccionado, onFiltroChange, onMesChange, onLimpiar, onExportar }) => {
    return (
        <div className="filtros-section">
            <h3><FaFilter /> Filtros</h3>
            <div className="filtros-grid">
                <div className="filtro-grupo filtro-mes-completo">
                    <label>Seleccionar Mes Completo:</label>
                    <input
                        type="month"
                        value={mesSeleccionado}
                        onChange={(e) => onMesChange(e.target.value)}
                        className="filtro-input"
                        placeholder="Seleccionar mes"
                    />
                    <small className="filtro-hint">Opcional: Selecciona un mes para filtrar automáticamente todo el mes</small>
                </div>
                
                <div className="filtro-grupo">
                    <label>Fecha Inicio:</label>
                    <input
                        type="date"
                        value={filtros.fechaInicio}
                        onChange={(e) => onFiltroChange('fechaInicio', e.target.value)}
                        className="filtro-input"
                    />
                </div>
                
                <div className="filtro-grupo">
                    <label>Fecha Fin:</label>
                    <input
                        type="date"
                        value={filtros.fechaFin}
                        onChange={(e) => onFiltroChange('fechaFin', e.target.value)}
                        className="filtro-input"
                    />
                </div>
                
                <div className="filtro-grupo">
                    <label>Método de Pago:</label>
                    <select
                        value={filtros.metodoPago}
                        onChange={(e) => onFiltroChange('metodoPago', e.target.value)}
                        className="filtro-select"
                    >
                        <option value="todos">Todos</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                    </select>
                </div>
                
                <div className="filtro-grupo">
                    <label>Tipo de Hospedaje:</label>
                    <select
                        value={filtros.tipoHospedaje}
                        onChange={(e) => onFiltroChange('tipoHospedaje', e.target.value)}
                        className="filtro-select"
                    >
                        <option value="todos">Todos</option>
                        <option value="cabaña">Cabañas</option>
                        <option value="camping">Camping</option>
                        <option value="dormis">Dormis</option>
                        <option value="grupos">Grupos</option>
                    </select>
                </div>
            </div>
            
            <div className="filtros-acciones">
                <button onClick={onLimpiar} className="btn-limpiar">
                    Limpiar Filtros
                </button>
                <button onClick={onExportar} className="btn-exportar">
                    <FaDownload /> Exportar CSV
                </button>
            </div>
        </div>
    );
};

export default FiltrosReportes;

