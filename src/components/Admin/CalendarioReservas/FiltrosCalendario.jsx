import React from 'react';
import './CalendarioReservas.css';

const TIPOS_ALOJAMIENTO = {
    CABANA: 'cabaña',
    DORMI: 'dormis',
    CAMPING: 'camping',
    GRUPOS: 'grupos'
};

const FiltrosCalendario = ({ filtroActivo, onCambiarFiltro }) => {
    return (
        <div className="filtros-container">
            <div className="filtros-titulo">Seleccionar tipo de hospedaje:</div>
            <div className="filtros-opciones">
                <button 
                    className={`filtro-btn ${filtroActivo === TIPOS_ALOJAMIENTO.CABANA ? 'activo' : ''}`}
                    onClick={() => onCambiarFiltro(TIPOS_ALOJAMIENTO.CABANA)}
                >
                    <span className="color-box" style={{ backgroundColor: '#4a90e2' }}></span>
                    Cabañas
                </button>
                <button 
                    className={`filtro-btn ${filtroActivo === TIPOS_ALOJAMIENTO.DORMI ? 'activo' : ''}`}
                    onClick={() => onCambiarFiltro(TIPOS_ALOJAMIENTO.DORMI)}
                >
                    <span className="color-box" style={{ backgroundColor: '#50c878' }}></span>
                    Dormis
                </button>
                <button 
                    className={`filtro-btn ${filtroActivo === TIPOS_ALOJAMIENTO.CAMPING ? 'activo' : ''}`}
                    onClick={() => onCambiarFiltro(TIPOS_ALOJAMIENTO.CAMPING)}
                >
                    <span className="color-box" style={{ backgroundColor: '#f5a623' }}></span>
                    Camping
                </button>
                <button 
                    className={`filtro-btn ${filtroActivo === TIPOS_ALOJAMIENTO.GRUPOS ? 'activo' : ''}`}
                    onClick={() => onCambiarFiltro(TIPOS_ALOJAMIENTO.GRUPOS)}
                >
                    <span className="color-box" style={{ backgroundColor: '#9b59b6' }}></span>
                    Grupos
                </button>
            </div>
        </div>
    );
};

export { FiltrosCalendario, TIPOS_ALOJAMIENTO }; 