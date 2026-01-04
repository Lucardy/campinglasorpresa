import React from 'react';

/**
 * Componente para mostrar el desglose de precio calculado
 */
const CalculadoraPrecio = ({
    desglosePrecio,
    tipoHospedajeNombre,
    reserva,
    cantidadAdultos,
    cantidadMenores,
    formData
}) => {
    const esCamping = tipoHospedajeNombre?.toLowerCase() === 'camping' || 
                     (tipoHospedajeNombre === '' && reserva?.tipo_hospedaje === 'camping');

    // Solo mostrar si hay datos suficientes
    if (!formData.fecha_entrada || !formData.fecha_salida || !formData.cantidad_personas) {
        return null;
    }

    return (
        <div className="desglose-precio">
            <h4>Desglose del Precio</h4>
            {esCamping ? (
                <>
                    <div className="desglose-item">
                        <span>Precio Base por día:</span>
                        <span>${desglosePrecio.precioBase.toLocaleString()}</span>
                    </div>
                    {cantidadAdultos !== '' && parseInt(cantidadAdultos) > 0 && (
                        <div className="desglose-item">
                            <span>Precio por {cantidadAdultos} adulto(s):</span>
                            <span>${desglosePrecio.precioAdultos.toLocaleString()}</span>
                        </div>
                    )}
                    {cantidadMenores !== '' && parseInt(cantidadMenores) > 0 && (
                        <div className="desglose-item">
                            <span>Precio por {cantidadMenores} menor(es):</span>
                            <span>${desglosePrecio.precioMenores.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="desglose-item">
                        <span>Precio total por día:</span>
                        <span>${desglosePrecio.precioPorDia.toLocaleString()}</span>
                    </div>
                </>
            ) : null}
            <div className="desglose-item">
                <span>Cantidad de días:</span>
                <span>{desglosePrecio.cantidadDias}</span>
            </div>
            <div className="desglose-item">
                <span>Subtotal:</span>
                <span>${desglosePrecio.subtotal ? desglosePrecio.subtotal.toLocaleString() : '0.00'}</span>
            </div>
            <div className="desglose-item">
                <span>Seña:</span>
                <span>-${desglosePrecio.descuento ? desglosePrecio.descuento.toLocaleString() : '0.00'}</span>
            </div>
            <div className="desglose-item total">
                <span>Total final:</span>
                <span>${desglosePrecio.total ? desglosePrecio.total.toLocaleString() : '0.00'}</span>
            </div>
        </div>
    );
};

export default CalculadoraPrecio;

