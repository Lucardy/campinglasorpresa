import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import { notify } from '../Notifications/NotificationSystem';
import config from '../../../config';
import './GestionPagos.css';

const GestionPagos = ({ reservaId, montoTotal, onPagoActualizado }) => {
    const [pagos, setPagos] = useState([]);
    const [totalPagado, setTotalPagado] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingPago, setEditingPago] = useState(null);
    const [formData, setFormData] = useState({
        monto: '',
        metodo_pago: 'efectivo',
        observaciones: ''
    });

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
            notify.error(error.message || 'Error al cargar los pagos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reservaId) {
            fetchPagos();
        }
    }, [reservaId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Calcular lo que falta pagar
    const faltaPagar = parseFloat(montoTotal) - totalPagado;
    const porcentajePagado = montoTotal > 0 ? (totalPagado / parseFloat(montoTotal)) * 100 : 0;

    // Obtener estado de pago
    const getEstadoPago = () => {
        if (totalPagado >= parseFloat(montoTotal)) {
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

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Abrir formulario para nuevo pago
    const handleNuevoPago = () => {
        setEditingPago(null);
        setFormData({
            monto: '',
            metodo_pago: 'efectivo',
            observaciones: ''
        });
        setShowForm(true);
    };

    // Abrir formulario para editar pago
    const handleEditarPago = (pago) => {
        setEditingPago(pago);
        setFormData({
            monto: pago.monto,
            metodo_pago: pago.metodo_pago,
            observaciones: pago.observaciones || ''
        });
        setShowForm(true);
    };

    // Guardar pago (crear o actualizar)
    const handleGuardarPago = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        try {
            if (!formData.monto || parseFloat(formData.monto) <= 0) {
                notify.error('El monto debe ser mayor a 0');
                return;
            }

            const montoIngresado = parseFloat(formData.monto);
            const nuevoTotal = editingPago 
                ? totalPagado - parseFloat(editingPago.monto) + montoIngresado
                : totalPagado + montoIngresado;

            if (nuevoTotal > parseFloat(montoTotal)) {
                notify.error(`El monto total de los pagos no puede exceder ${formatCurrency(montoTotal)}`);
                return;
            }

            setLoading(true);
            const apiUrl = getApiUrl('pagos.php');
            const method = editingPago ? 'PUT' : 'POST';
            const body = editingPago
                ? { id: editingPago.id, ...formData, reserva_id: reservaId }
                : { ...formData, reserva_id: reservaId };

            const response = await fetch(apiUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el pago');
            }

            const data = await response.json();
            
            if (data.success) {
                notify.success(editingPago ? 'Pago actualizado exitosamente' : 'Pago creado exitosamente');
                setShowForm(false);
                setEditingPago(null);
                fetchPagos();
                if (onPagoActualizado) {
                    onPagoActualizado();
                }
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

    // Eliminar pago
    const handleEliminarPago = async (pagoId) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este pago?')) {
            return;
        }

        try {
            setLoading(true);
            const apiUrl = getApiUrl('pagos.php', `?id=${pagoId}`);
            const response = await fetch(apiUrl, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el pago');
            }

            const data = await response.json();
            
            if (data.success) {
                notify.success('Pago eliminado exitosamente');
                fetchPagos();
                if (onPagoActualizado) {
                    onPagoActualizado();
                }
            } else {
                throw new Error(data.message || 'Error al eliminar el pago');
            }
        } catch (error) {
            console.error('Error al eliminar pago:', error);
            notify.error(error.message || 'Error al eliminar el pago');
        } finally {
            setLoading(false);
        }
    };

    // Cancelar formulario
    const handleCancelar = () => {
        setShowForm(false);
        setEditingPago(null);
        setFormData({
            monto: '',
            metodo_pago: 'efectivo',
            observaciones: ''
        });
    };

    return (
        <div className="gestion-pagos">
            <div className="gestion-pagos-header">
                <h4>
                    <FaMoneyBillWave /> Gestión de Pagos
                </h4>
                {!showForm && (
                    <button 
                        type="button" 
                        className="btn-agregar-pago"
                        onClick={handleNuevoPago}
                        disabled={loading || faltaPagar <= 0}
                        title={faltaPagar <= 0 ? 'La reserva ya está completamente pagada' : 'Agregar nuevo pago'}
                    >
                        <FaPlus /> Agregar Pago
                    </button>
                )}
            </div>

            {/* Resumen de pagos */}
            <div className="resumen-pagos">
                <div className="resumen-item">
                    <span className="resumen-label">Monto Total:</span>
                    <span className="resumen-valor">{formatCurrency(montoTotal)}</span>
                </div>
                <div className="resumen-item">
                    <span className="resumen-label">Total Pagado:</span>
                    <span className="resumen-valor pagado">{formatCurrency(totalPagado)}</span>
                </div>
                <div className="resumen-item">
                    <span className="resumen-label">Falta Pagar:</span>
                    <span className={`resumen-valor ${faltaPagar > 0 ? 'falta' : 'completo'}`}>
                        {formatCurrency(Math.max(0, faltaPagar))}
                    </span>
                </div>
                <div className="resumen-item estado">
                    <span className="resumen-label">Estado:</span>
                    <span className={`resumen-valor estado-${estadoPago.clase}`}>
                        <EstadoIcon /> {estadoPago.texto}
                    </span>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="progreso-pago">
                <div 
                    className="progreso-barra"
                    style={{ width: `${Math.min(100, porcentajePagado)}%` }}
                >
                    <span className="progreso-texto">
                        {porcentajePagado.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Formulario de pago */}
            {showForm && (
                <div className="form-pago">
                    <h5>{editingPago ? 'Editar Pago' : 'Nuevo Pago'}</h5>
                    <div onSubmit={handleGuardarPago} onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
                            e.preventDefault();
                            handleGuardarPago(e);
                        }
                    }}>
                        <div className="form-group">
                            <label>Monto *</label>
                            <input
                                type="number"
                                name="monto"
                                value={formData.monto}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0.01"
                                max={faltaPagar + (editingPago ? parseFloat(editingPago.monto) : 0)}
                                required
                                placeholder="0.00"
                            />
                            <small>
                                Máximo: {formatCurrency(faltaPagar + (editingPago ? parseFloat(editingPago.monto) : 0))}
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
                                rows="2"
                            />
                        </div>
                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn-cancelar"
                                onClick={handleCancelar}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                className="btn-guardar"
                                onClick={handleGuardarPago}
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : (editingPago ? 'Actualizar' : 'Guardar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de pagos */}
            {!showForm && (
                <div className="lista-pagos">
                    {loading && pagos.length === 0 ? (
                        <div className="loading">Cargando pagos...</div>
                    ) : pagos.length === 0 ? (
                        <div className="sin-pagos">
                            <p>No hay pagos registrados para esta reserva.</p>
                        </div>
                    ) : (
                        <table className="tabla-pagos">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Método</th>
                                    <th>Observaciones</th>
                                    <th>Acciones</th>
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
                                        <td className="acciones">
                                            <button
                                                type="button"
                                                className="btn-editar"
                                                onClick={() => handleEditarPago(pago)}
                                                title="Editar pago"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-eliminar"
                                                onClick={() => handleEliminarPago(pago.id)}
                                                title="Eliminar pago"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default GestionPagos;

