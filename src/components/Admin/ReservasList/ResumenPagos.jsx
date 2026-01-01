import React, { useState, useEffect, useMemo } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import config from '../../../config';
import './ResumenPagos.css';

const ResumenPagos = ({ reservaId, montoTotal, descuento = 0, refreshKey = 0 }) => {
    const [pagos, setPagos] = useState([]);
    const [totalPagado, setTotalPagado] = useState(0);
    const [loading, setLoading] = useState(false);

    // Obtener URL de API según entorno
    const getApiUrl = (endpoint, params = '') => {
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDev) {
            return `http://localhost/campinglasorpresa/api/endpoints/${endpoint}${params}`;
        } else {
            return `${config.API_URL}/${endpoint}${params}`;
        }
    };

    // Cargar pagos
    const fetchPagos = async () => {
        try {
            setLoading(true);
            const apiUrl = getApiUrl('pagos.php', `?reserva_id=${reservaId}`);
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error('Error al cargar los pagos');
            }
            
            const data = await response.json();
            
            if (data.success) {
                setPagos(data.pagos || []);
                setTotalPagado(data.total_pagado || 0);
            } else {
                throw new Error(data.message || 'Error al cargar los pagos');
            }
        } catch (error) {
            console.error('Error al cargar pagos:', error);
            // No mostrar error al usuario en modo solo lectura
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reservaId) {
            fetchPagos();
        }
    }, [reservaId, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Calcular el monto total real usando useMemo para que no cambie cuando totalPagado cambie
    // IMPORTANTE: El monto total NO debe cambiar cuando se agregan pagos.
    // Solo cambia si se edita la reserva (fechas, hospedaje, método de pago, etc.)
    // 
    // Lógica igual que en GestionPagos del modal de editar:
    // En el modal de editar, formData.monto_total se recalcula como subtotal completo (sin descontar la seña)
    // y se pasa directamente a GestionPagos, que lo usa sin modificarlo.
    // 
    // Diferencia entre reservas nuevas y antiguas:
    // - Reservas nuevas: monto_total ya es el total completo (sin descontar la seña), NO debemos sumar el descuento
    // - Reservas antiguas: monto_total tiene la seña descontada, entonces monto_total + descuento = total real
    // 
    // Detección: Si monto_total >= descuento, entonces es una reserva nueva donde monto_total ya es el total completo.
    // Si monto_total < descuento, entonces es una reserva antigua donde monto_total tiene la seña descontada.
    const montoTotalReal = useMemo(() => {
        const descuentoValue = parseFloat(descuento) || 0;
        const montoTotalNum = parseFloat(montoTotal) || 0;
        
        // Calcular monto total real (FIJO - no cambia con los pagos)
        let montoTotalRealCalculado = montoTotalNum;
        
        if (descuentoValue > 0) {
            // Detectar si es reserva nueva o antigua basándose solo en monto_total y descuento
            // Reserva nueva: monto_total >= descuento (monto_total ya es el total completo)
            // Reserva antigua: monto_total < descuento (monto_total tiene la seña descontada)
            const esReservaNueva = montoTotalNum >= descuentoValue;
            
            if (!esReservaNueva) {
                // Es una reserva antigua: monto_total tiene la seña descontada
                // Sumar el descuento para obtener el total real
                montoTotalRealCalculado = montoTotalNum + descuentoValue;
            }
            // Si es reserva nueva, montoTotalRealCalculado = montoTotalNum (ya correcto)
        }
        
        return montoTotalRealCalculado;
    }, [montoTotal, descuento]); // Solo recalcular cuando cambien montoTotal o descuento, NO cuando cambie totalPagado

    // Calcular lo que falta pagar
    const faltaPagar = montoTotalReal - totalPagado;
    const porcentajePagado = montoTotalReal > 0 ? (totalPagado / montoTotalReal) * 100 : 0;

    // Obtener estado de pago
    const getEstadoPago = () => {
        if (totalPagado >= montoTotalReal) {
            return { texto: 'Completo', icono: FaCheckCircle, clase: 'completo' };
        } else if (totalPagado > 0) {
            return { texto: 'Parcial', icono: FaExclamationCircle, clase: 'parcial' };
        } else {
            return { texto: 'Pendiente', icono: FaClock, clase: 'pendiente' };
        }
    };

    const estadoPago = getEstadoPago();
    const EstadoIcon = estadoPago.icono;

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="resumen-pagos-view">
            <div className="resumen-pagos-header-view">
                <h4>
                    <FaMoneyBillWave /> Estado de Pagos
                </h4>
            </div>

            {/* Resumen de pagos */}
            <div className="resumen-pagos-view-content">
                <div className="resumen-item-view">
                    <span className="resumen-label-view">Monto Total:</span>
                    <span className="resumen-valor-view">{formatCurrency(montoTotalReal)}</span>
                </div>
                <div className="resumen-item-view">
                    <span className="resumen-label-view">Total Pagado:</span>
                    <span className="resumen-valor-view pagado">{formatCurrency(totalPagado)}</span>
                </div>
                <div className="resumen-item-view">
                    <span className="resumen-label-view">Falta Pagar:</span>
                    <span className={`resumen-valor-view ${faltaPagar > 0 ? 'falta' : 'completo'}`}>
                        {formatCurrency(Math.max(0, faltaPagar))}
                    </span>
                </div>
                <div className="resumen-item-view estado">
                    <span className="resumen-label-view">Estado:</span>
                    <span className={`resumen-valor-view estado-${estadoPago.clase}`}>
                        <EstadoIcon /> {estadoPago.texto}
                    </span>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="progreso-pago-view">
                <div 
                    className="progreso-barra-view"
                    style={{ width: `${Math.min(100, porcentajePagado)}%` }}
                >
                    <span className="progreso-texto-view">
                        {porcentajePagado.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Lista de pagos */}
            {loading ? (
                <div className="loading-pagos">Cargando pagos...</div>
            ) : pagos.length > 0 ? (
                <div className="lista-pagos-view">
                    <h5>Historial de Pagos</h5>
                    <table className="tabla-pagos-view">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Método</th>
                                <th>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map(pago => (
                                <tr key={pago.id}>
                                    <td>{formatDate(pago.fecha_pago)}</td>
                                    <td className="monto">{formatCurrency(pago.monto)}</td>
                                    <td>
                                        <span className={`metodo metodo-${pago.metodo_pago}`}>
                                            {pago.metodo_pago === 'efectivo' && '💵'}
                                            {pago.metodo_pago === 'transferencia' && '🏦'}
                                            {pago.metodo_pago === 'tarjeta' && '💳'}
                                            {pago.metodo_pago}
                                        </span>
                                    </td>
                                    <td className="observaciones">
                                        {pago.observaciones || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="sin-pagos-view">
                    <p>No hay pagos registrados para esta reserva.</p>
                </div>
            )}
        </div>
    );
};

export default ResumenPagos;

