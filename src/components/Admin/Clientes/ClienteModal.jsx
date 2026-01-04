import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendar, FaMapMarkerAlt, FaPhone, FaIdCard, FaCar, FaUser, FaClock, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import config from '../../../config';
import { formatDate, formatDateTime, calcularNoches } from '../../../utils/dateUtils';
import './ClienteModal.css';
import reservaService from '../../../services/reservaService';

const ClienteModal = ({ cliente, isOpen, onClose }) => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && cliente) {
            fetchReservasCliente();
        }
    }, [isOpen, cliente]);

    const fetchReservasCliente = async () => {
        if (!cliente) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const data = await reservaService.getReservasByCliente(cliente.id);
            setReservas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar las reservas del cliente');
        } finally {
            setLoading(false);
        }
    };

    const formatPhone = (phone) => {
        if (!phone) return 'No disponible';
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
    };

    // Usar las funciones formatDate y formatDateTime importadas de dateUtils

    const getEstadoColor = (estado) => {
        const colores = {
            'activa': '#10b981',
            'finalizada': '#6b7280',
            'cancelada': '#ef4444'
        };
        return colores[estado] || '#6b7280';
    };

    const getEstadoText = (estado) => {
        const textos = {
            'activa': 'Activa',
            'finalizada': 'Finalizada',
            'cancelada': 'Cancelada'
        };
        return textos[estado] || estado;
    };

    const formatCurrency = (amount) => {
        const num = Math.round(parseFloat(amount) || 0);
        return `$${num}`;
    };

    // Calcular monto total real de una reserva (considerando reservas antiguas vs nuevas)
    const getMontoTotalReal = (reserva) => {
        const montoTotalNum = parseFloat(reserva.monto_total || 0);
        const descuentoValue = parseFloat(reserva.descuento || 0);
        
        let montoTotalReal = montoTotalNum;
        if (descuentoValue > 0) {
            const esReservaNueva = montoTotalNum >= descuentoValue;
            if (!esReservaNueva) {
                montoTotalReal = montoTotalNum + descuentoValue;
            }
        }
        return montoTotalReal;
    };

    // Obtener información del estado de pago
    const getEstadoPagoInfo = (reserva) => {
        const estadoPago = reserva.estado_pago || 'pendiente';
        const totalPagado = parseFloat(reserva.total_pagado || 0);
        const montoTotalReal = getMontoTotalReal(reserva);
        const faltaPagar = montoTotalReal - totalPagado;
        const porcentajePagado = montoTotalReal > 0 ? (totalPagado / montoTotalReal) * 100 : 0;

        switch (estadoPago) {
            case 'completo':
                return {
                    texto: 'Completo',
                    icono: FaCheckCircle,
                    clase: 'completo',
                    color: '#10b981',
                    totalPagado,
                    faltaPagar: 0,
                    porcentajePagado: 100
                };
            case 'parcial':
                return {
                    texto: 'Parcial',
                    icono: FaExclamationCircle,
                    clase: 'parcial',
                    color: '#f59e0b',
                    totalPagado,
                    faltaPagar,
                    porcentajePagado
                };
            default:
                return {
                    texto: 'Pendiente',
                    icono: FaClock,
                    clase: 'pendiente',
                    color: '#6b7280',
                    totalPagado: 0,
                    faltaPagar: montoTotalReal,
                    porcentajePagado: 0
                };
        }
    };

    // Calcular estadísticas totales
    const calcularEstadisticas = () => {
        const totalNoches = reservas.reduce((sum, r) => sum + calcularNoches(r.fecha_entrada, r.fecha_salida), 0);
        const totalMonto = reservas.reduce((sum, r) => sum + getMontoTotalReal(r), 0);
        const totalPagado = reservas.reduce((sum, r) => sum + parseFloat(r.total_pagado || 0), 0);
        const totalPendiente = totalMonto - totalPagado;
        const promedioPorReserva = reservas.length > 0 ? totalMonto / reservas.length : 0;
        const reservasActivas = reservas.filter(r => r.estado === 'activa').length;
        const reservasFinalizadas = reservas.filter(r => r.estado === 'finalizada').length;
        const reservasCanceladas = reservas.filter(r => r.estado === 'cancelada').length;

        return {
            totalNoches,
            totalMonto,
            totalPagado,
            totalPendiente,
            promedioPorReserva,
            reservasActivas,
            reservasFinalizadas,
            reservasCanceladas
        };
    };

    const estadisticas = calcularEstadisticas();

    if (!isOpen || !cliente) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="cliente-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="cliente-modal-header">
                    <h2>Detalles del Cliente</h2>
                    <button className="cliente-modal-close" onClick={onClose} aria-label="Cerrar modal">
                        <FaTimes />
                    </button>
                </div>

                <div className="cliente-modal-body">
                    {/* Información Personal */}
                    <div className="cliente-modal-section">
                        <h3 className="section-title">
                            <FaUser className="section-icon" />
                            Información Personal
                        </h3>
                        <div className="info-grid">
                            <div className="cliente-modal-item">
                                <FaIdCard className="info-icon" />
                                <div className="info-content">
                                    <label>Nombre Completo:</label>
                                    <span>{cliente.apellido}, {cliente.nombre}</span>
                                </div>
                            </div>
                            <div className="cliente-modal-item">
                                <FaIdCard className="info-icon" />
                                <div className="info-content">
                                    <label>DNI:</label>
                                    <span>{cliente.documento}</span>
                                </div>
                            </div>
                            <div className="cliente-modal-item">
                                <FaPhone className="info-icon" />
                                <div className="info-content">
                                    <label>Teléfono:</label>
                                    <span>{formatPhone(cliente.telefono)}</span>
                                </div>
                            </div>
                            <div className="cliente-modal-item">
                                <FaCar className="info-icon" />
                                <div className="info-content">
                                    <label>Vehículo:</label>
                                    <span>{cliente.modelo_vehiculo || 'No especificado'}</span>
                                </div>
                            </div>
                            <div className="cliente-modal-item">
                                <FaCar className="info-icon" />
                                <div className="info-content">
                                    <label>Patente:</label>
                                    <span>{cliente.patente || 'No especificada'}</span>
                                </div>
                            </div>
                            <div className="cliente-modal-item">
                                <FaClock className="info-icon" />
                                <div className="info-content">
                                    <label>Fecha de Registro:</label>
                                    <span>{formatDateTime(cliente.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="cliente-modal-section">
                        <h3 className="section-title">
                            <FaCalendar className="section-icon" />
                            Estadísticas del Cliente
                        </h3>
                        <div className="stats-info">
                            <p>Estadísticas específicas de {cliente.nombre} {cliente.apellido}</p>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-number">{reservas.length}</div>
                                <div className="stat-label">Total de Reservas</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{estadisticas.totalNoches}</div>
                                <div className="stat-label">Total de Noches</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{formatCurrency(estadisticas.totalMonto)}</div>
                                <div className="stat-label">Monto Total</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{formatCurrency(estadisticas.totalPagado)}</div>
                                <div className="stat-label">Total Pagado</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{formatCurrency(estadisticas.totalPendiente)}</div>
                                <div className="stat-label">Total Pendiente</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{formatCurrency(estadisticas.promedioPorReserva)}</div>
                                <div className="stat-label">Promedio por Reserva</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{estadisticas.reservasActivas}</div>
                                <div className="stat-label">Reservas Activas</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{estadisticas.reservasFinalizadas}</div>
                                <div className="stat-label">Reservas Finalizadas</div>
                            </div>
                        </div>
                    </div>

                    {/* Reservaciones */}
                    <div className="cliente-modal-section">
                        <h3 className="section-title">
                            <FaCalendar className="section-icon" />
                            Historial de Reservaciones
                        </h3>
                        
                        {loading && (
                            <div className="loading-message">
                                Cargando reservaciones...
                            </div>
                        )}
                        
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                        
                        {!loading && !error && reservas.length === 0 && (
                            <div className="no-reservas">
                                <p>Este cliente no tiene reservaciones registradas.</p>
                            </div>
                        )}
                        
                        {!loading && !error && reservas.length > 0 && (
                            <div className="reservas-list">
                                {reservas.map((reserva) => (
                                    <div key={reserva.id} className="reserva-item">
                                        <div className="reserva-header">
                                            <div className="reserva-tipo">
                                                <FaMapMarkerAlt className="reserva-icon" />
                                                {reserva.tipo_hospedaje === 'grupos' 
                                                    ? `Grupo - ${reserva.cantidad_personas} personas`
                                                    : `${reserva.tipo_hospedaje} ${reserva.numero_hospedaje}`
                                                }
                                            </div>
                                            <span 
                                                className="reserva-estado"
                                                style={{ backgroundColor: getEstadoColor(reserva.estado) }}
                                            >
                                                {getEstadoText(reserva.estado)}
                                            </span>
                                        </div>
                                        <div className="reserva-details">
                                            <div className="reserva-dates">
                                                <div className="date-item">
                                                    <FaCalendar className="date-icon" />
                                                    <span><strong>Entrada:</strong> {formatDate(reserva.fecha_entrada)}</span>
                                                </div>
                                                <div className="date-item">
                                                    <FaCalendar className="date-icon" />
                                                    <span><strong>Salida:</strong> {formatDate(reserva.fecha_salida)}</span>
                                                </div>
                                                <div className="date-item">
                                                    <FaClock className="date-icon" />
                                                    <span><strong>Noches:</strong> {calcularNoches(reserva.fecha_entrada, reserva.fecha_salida)} noche{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida) !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            <div className="reserva-info">
                                                <span><strong>Personas:</strong> {reserva.cantidad_personas}</span>
                                                <span><strong>Monto Total:</strong> {formatCurrency(getMontoTotalReal(reserva))}</span>
                                                <span><strong>Método de Pago:</strong> {reserva.metodo_pago || 'No especificado'}</span>
                                                <span><strong>Fecha de reserva:</strong> {formatDateTime(reserva.created_at)}</span>
                                            </div>
                                            
                                            {/* Información de Pagos */}
                                            {(() => {
                                                const estadoPagoInfo = getEstadoPagoInfo(reserva);
                                                const EstadoIcon = estadoPagoInfo.icono;
                                                return (
                                                    <div className="reserva-pagos">
                                                        <div className="pagos-header">
                                                            <FaMoneyBillWave className="pagos-icon" />
                                                            <strong>Estado de Pago:</strong>
                                                            <span className={`estado-pago-badge estado-${estadoPagoInfo.clase}`}>
                                                                <EstadoIcon /> {estadoPagoInfo.texto}
                                                            </span>
                                                        </div>
                                                        <div className="pagos-details">
                                                            <div className="pago-item">
                                                                <span className="pago-label">Total Pagado:</span>
                                                                <span className="pago-value">{formatCurrency(estadoPagoInfo.totalPagado)}</span>
                                                            </div>
                                                            <div className="pago-item">
                                                                <span className="pago-label">Falta Pagar:</span>
                                                                <span className={`pago-value ${estadoPagoInfo.faltaPagar > 0 ? 'falta-pagar' : 'completo'}`}>
                                                                    {formatCurrency(estadoPagoInfo.faltaPagar)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {estadoPagoInfo.porcentajePagado > 0 && (
                                                            <div className="pago-progress">
                                                                <div className="progress-bar-container">
                                                                    <div 
                                                                        className="progress-bar-fill"
                                                                        style={{ 
                                                                            width: `${estadoPagoInfo.porcentajePagado}%`,
                                                                            backgroundColor: estadoPagoInfo.color
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="progress-text">{estadoPagoInfo.porcentajePagado.toFixed(0)}% pagado</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            {reserva.observaciones && (
                                                <div className="reserva-observaciones">
                                                    <strong>Observaciones:</strong> {reserva.observaciones}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClienteModal; 