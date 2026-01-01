import React from 'react';
import './CalendarioReservas.css';

const DetalleReserva = ({ reserva, onCerrar }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!reserva) return null;

    return (
        <div className="reserva-detalle">
            <div className="reserva-detalle-header">
                <h3>Detalles de la Reserva #{reserva.id}</h3>
                <button 
                    className="cerrar-detalle"
                    onClick={onCerrar}
                >
                    ✕
                </button>
            </div>

            <div className="detalle-grid">
                <div className="detalle-seccion">
                    <h4>Información del Cliente</h4>
                    <div className="detalle-item">
                        <strong>Nombre:</strong>
                        <span>{reserva.apellido}, {reserva.nombre}</span>
                    </div>
                    {reserva.documento && (
                        <div className="detalle-item">
                            <strong>Documento:</strong>
                            <span>{reserva.documento}</span>
                        </div>
                    )}
                    {reserva.telefono && (
                        <div className="detalle-item">
                            <strong>Teléfono:</strong>
                            <span>{reserva.telefono}</span>
                        </div>
                    )}
                </div>

                <div className="detalle-seccion">
                    <h4>Detalles de la Reserva</h4>
                    <div className="detalle-item">
                        <strong>Hospedaje:</strong>
                        <span>{reserva.tipo_hospedaje} {reserva.numero_hospedaje}</span>
                    </div>
                    <div className="detalle-item">
                        <strong>Estado:</strong>
                        <span className={`estado-badge estado-${reserva.estado.toLowerCase()}`}>
                            {reserva.estado}
                        </span>
                    </div>
                    <div className="detalle-item">
                        <strong>Cantidad de Personas:</strong>
                        <span>{reserva.cantidad_personas}</span>
                    </div>
                </div>

                <div className="detalle-seccion">
                    <h4>Fechas y Monto</h4>
                    <div className="detalle-item">
                        <strong>Entrada:</strong>
                        <span>{formatDate(reserva.fecha_entrada)}</span>
                    </div>
                    <div className="detalle-item">
                        <strong>Salida:</strong>
                        <span>{formatDate(reserva.fecha_salida)}</span>
                    </div>
                    <div className="detalle-item">
                        <strong>Monto Total:</strong>
                        <span className="monto-total">{formatCurrency(reserva.monto_total)}</span>
                    </div>
                </div>

                {reserva.observaciones && (
                    <div className="detalle-seccion observaciones">
                        <h4>Observaciones</h4>
                        <div className="detalle-item">
                            <span>{reserva.observaciones}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetalleReserva; 