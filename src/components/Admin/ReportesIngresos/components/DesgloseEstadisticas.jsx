import React, { memo } from 'react';
import { getIconoTipoHospedaje, getIconoMetodoPago, formatearPrecio } from '../utils';

const DesgloseEstadisticas = memo(({ tipo, datos, mostrarDetalle = false }) => {
    if (!datos || Object.keys(datos).length === 0) return null;

    const getIcono = (item) => {
        return tipo === 'metodoPago' 
            ? getIconoMetodoPago(item)
            : getIconoTipoHospedaje(item);
    };

    const getLabel = (item) => {
        return tipo === 'metodoPago' ? 'pagos' : 'reservas';
    };

    return (
        <div className="desglose-section">
            <h4>Por {tipo === 'metodoPago' ? 'Método de Pago' : 'Tipo de Hospedaje'}</h4>
            <div className="desglose-grid">
                {Object.entries(datos).map(([item, datosItem]) => (
                    <div key={item} className="desglose-item">
                        <span className="desglose-label">
                            {getIcono(item)} {item}
                        </span>
                        <span className="desglose-valor">
                            {mostrarDetalle ? (
                                <>
                                    <div>Total: {formatearPrecio(datosItem.total)}</div>
                                    {datosItem.pagado !== undefined && (
                                        <div>Pagado: {formatearPrecio(datosItem.pagado)}</div>
                                    )}
                                    {datosItem.pendiente !== undefined && (
                                        <div>Pendiente: {formatearPrecio(datosItem.pendiente)}</div>
                                    )}
                                    <div>({datosItem.cantidad} {getLabel(item)})</div>
                                </>
                            ) : (
                                <>
                                    {formatearPrecio(datosItem.total)} ({datosItem.cantidad} {getLabel(item)})
                                </>
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

DesgloseEstadisticas.displayName = 'DesgloseEstadisticas';

export default DesgloseEstadisticas;

