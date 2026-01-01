import React, { useState } from 'react';
import { formatDateForCalendar, calcularNoches } from '../../../utils/dateUtils';
import ResumenPagos from '../ReservasList/ResumenPagos';
import AgregarPagoModal from './AgregarPagoModal';
import './CalendarioReservas.css';

const DetalleReserva = ({ reserva, onCerrar, onEliminar, onExtender, onEditar, refreshPagosKey = 0, onPagoAgregado }) => {
    const [showAgregarPago, setShowAgregarPago] = useState(false);
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    // Usar la función de utilidad para formatear fechas
    const formatDate = formatDateForCalendar;


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
                    {reserva.modelo_vehiculo && (
                        <div className="detalle-item">
                            <strong>Modelo Vehículo:</strong>
                            <span>{reserva.modelo_vehiculo}</span>
                        </div>
                    )}
                    {reserva.patente && (
                        <div className="detalle-item">
                            <strong>Patente:</strong>
                            <span>{reserva.patente}</span>
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
                        <span className={`estado-badge estado-${(reserva.estado || 'pendiente').toLowerCase()}`}>
                            {reserva.estado}
                        </span>
                    </div>
                    <div className="detalle-item">
                        <strong>Cantidad de Personas:</strong>
                        <span>{reserva.cantidad_personas}</span>
                    </div>
                </div>

                <div className="detalle-seccion">
                    <h4>Fechas</h4>
                    <div className="detalle-item">
                        <strong>Entrada:</strong>
                        <span>{formatDate(reserva.fecha_entrada)}</span>
                    </div>
                    <div className="detalle-item">
                        <strong>Salida:</strong>
                        <span>{formatDate(reserva.fecha_salida)}</span>
                    </div>
                    <div className="detalle-item">
                        <strong>Noches:</strong>
                        <span>{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida)} noche{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida) !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Resumen de Pagos */}
                <div className="detalle-seccion detalle-seccion-pagos">
                    <ResumenPagos 
                        reservaId={reserva.id}
                        montoTotal={reserva.monto_total}
                        descuento={reserva.descuento || 0}
                        refreshKey={refreshPagosKey}
                    />
                </div>

                {reserva.observaciones && (
                    <div className="detalle-seccion observaciones">
                        <h4>Observaciones</h4>
                        <div className="detalle-item">
                            <span>{reserva.observaciones}</span>
                        </div>
                    </div>
                )}

                <div className="detalle-acciones">
                    {onEditar && (
                        <button 
                            className="btn-editar-reserva"
                            onClick={() => onEditar(reserva)}
                        >
                            ✏️ Editar Reserva
                        </button>
                    )}
                    <button 
                        className="btn-agregar-pago-calendario"
                        onClick={() => setShowAgregarPago(true)}
                        title="Agregar un nuevo pago a esta reserva"
                    >
                        💰 Agregar Pago
                    </button>
                    {onExtender && (
                        <button 
                            className="btn-extend-reserva"
                            onClick={() => onExtender(reserva)}
                        >
                            Agregar 1 día
                        </button>
                    )}
                    {onEliminar && (
                        <button 
                            className="btn-eliminar-reserva"
                            onClick={() => onEliminar(reserva)}
                        >
                            Eliminar reserva
                        </button>
                    )}
                </div>
            </div>

            {showAgregarPago && (
                <AgregarPagoModal
                    reserva={reserva}
                    onCerrar={() => setShowAgregarPago(false)}
                    onPagoAgregado={() => {
                        setShowAgregarPago(false);
                        if (onPagoAgregado) {
                            onPagoAgregado();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default DetalleReserva; 