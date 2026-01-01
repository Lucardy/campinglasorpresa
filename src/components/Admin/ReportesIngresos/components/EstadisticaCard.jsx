import React, { memo } from 'react';

const EstadisticaCard = memo(({ icono, titulo, valor, variante = '' }) => {
    return (
        <div className={`estadistica-card ${variante}`}>
            <div className="estadistica-icono">
                {icono}
            </div>
            <div className="estadistica-contenido">
                <h4>{titulo}</h4>
                <p>{valor}</p>
            </div>
        </div>
    );
});

EstadisticaCard.displayName = 'EstadisticaCard';

export default EstadisticaCard;

