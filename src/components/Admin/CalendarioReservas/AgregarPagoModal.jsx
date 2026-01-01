import React, { useState } from 'react';
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import { notify } from '../Notifications/NotificationSystem';
import config from '../../../config';
import './CalendarioReservas.css';

const AgregarPagoModal = ({ reserva, onCerrar, onPagoAgregado }) => {
    const [formData, setFormData] = useState({
        monto: '',
        metodo_pago: 'efectivo',
        observaciones: ''
    });
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

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calcular monto total real (igual lógica que ResumenPagos)
    const calcularMontoTotalReal = () => {
        const descuento = parseFloat(reserva.descuento) || 0;
        const montoTotalNum = parseFloat(reserva.monto_total) || 0;
        
        if (descuento > 0) {
            const esReservaNueva = montoTotalNum >= descuento;
            if (!esReservaNueva) {
                return montoTotalNum + descuento;
            }
        }
        return montoTotalNum;
    };

    const montoTotalReal = calcularMontoTotalReal();

    // Obtener total pagado actual
    const [totalPagado, setTotalPagado] = useState(0);

    // Cargar total pagado
    React.useEffect(() => {
        const fetchTotalPagado = async () => {
            try {
                const apiUrl = getApiUrl('pagos.php', `?reserva_id=${reserva.id}`);
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setTotalPagado(data.total_pagado || 0);
                    }
                }
            } catch (error) {
                console.error('Error al cargar total pagado:', error);
            }
        };
        fetchTotalPagado();
    }, [reserva.id]);

    const faltaPagar = montoTotalReal - totalPagado;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (!formData.monto || parseFloat(formData.monto) <= 0) {
                notify.error('El monto debe ser mayor a 0');
                return;
            }

            const montoIngresado = parseFloat(formData.monto);
            const nuevoTotal = totalPagado + montoIngresado;

            if (nuevoTotal > montoTotalReal) {
                notify.error(`El monto total de los pagos no puede exceder ${formatCurrency(montoTotalReal)}`);
                return;
            }

            setLoading(true);
            const apiUrl = getApiUrl('pagos.php');
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    reserva_id: reserva.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el pago');
            }

            const data = await response.json();
            
            if (data.success) {
                notify.success('Pago agregado exitosamente');
                if (onPagoAgregado) {
                    onPagoAgregado();
                }
                onCerrar();
            } else {
                throw new Error(data.message || 'Error al guardar el pago');
            }
        } catch (error) {
            console.error('Error al guardar pago:', error);
            notify.error(error.message || 'Error al guardar el pago');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-content-agregar-pago" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-agregar-pago">
                    <h3>
                        <FaMoneyBillWave /> Agregar Pago - Reserva #{reserva.id}
                    </h3>
                    <button className="modal-close" onClick={onCerrar}>
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body-agregar-pago">
                    <div className="resumen-pago-info">
                        <div className="info-item">
                            <span>Monto Total:</span>
                            <strong>{formatCurrency(montoTotalReal)}</strong>
                        </div>
                        <div className="info-item">
                            <span>Total Pagado:</span>
                            <strong>{formatCurrency(totalPagado)}</strong>
                        </div>
                        <div className="info-item">
                            <span>Falta Pagar:</span>
                            <strong className={faltaPagar > 0 ? 'falta' : 'completo'}>
                                {formatCurrency(Math.max(0, faltaPagar))}
                            </strong>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Monto *</label>
                            <input
                                type="number"
                                name="monto"
                                value={formData.monto}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0.01"
                                max={faltaPagar}
                                required
                                placeholder="0.00"
                                autoFocus
                            />
                            <small>
                                Máximo: {formatCurrency(faltaPagar)}
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Método de Pago *</label>
                            <select
                                name="metodo_pago"
                                value={formData.metodo_pago}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="efectivo">💵 Efectivo</option>
                                <option value="transferencia">🏦 Transferencia</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Observaciones</label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleInputChange}
                                placeholder="Notas adicionales sobre el pago..."
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn-cancelar"
                                onClick={onCerrar}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn-guardar"
                                disabled={loading || faltaPagar <= 0}
                            >
                                {loading ? 'Guardando...' : 'Agregar Pago'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgregarPagoModal;

