import React from 'react';

const SeccionReporte = ({ titulo, icono, descripcion, variante = '', children }) => {
    return (
        <div className={`seccion-reporte ${variante}`}>
            <div className="seccion-header">
                <h2>{icono} {titulo}</h2>
                <p className="seccion-descripcion">{descripcion}</p>
            </div>
            {children}
        </div>
    );
};

export default SeccionReporte;

