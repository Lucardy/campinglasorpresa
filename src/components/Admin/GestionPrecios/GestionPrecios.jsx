import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaMoneyBillWave, FaUsers, FaCreditCard } from 'react-icons/fa';
import { notify } from '../Notifications/NotificationSystem';
import config from '../../../config';
import './GestionPrecios.css';

const GestionPrecios = () => {
    const [precios, setPrecios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editandoId, setEditandoId] = useState(null);
    const [precioEditando, setPrecioEditando] = useState('');

    useEffect(() => {
        cargarPrecios();
    }, []);

    const cargarPrecios = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_URL}/hospedajes.php?todos_precios`);
            if (!response.ok) throw new Error('Error al cargar precios');
            
            const data = await response.json();
            if (data.success) {
                setPrecios(data.precios);
            } else {
                throw new Error(data.error || 'Error al cargar precios');
            }
        } catch (error) {
            console.error('Error:', error);
            notify.error('Error al cargar los precios');
        } finally {
            setLoading(false);
        }
    };

    const iniciarEdicion = (precio) => {
        setEditandoId(precio.id);
        setPrecioEditando(precio.precio.toString());
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setPrecioEditando('');
    };

    const guardarPrecio = async (precio) => {
        try {
            const nuevoPrecio = parseFloat(precioEditando);
            if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
                notify.error('El precio debe ser un número válido mayor o igual a 0');
                return;
            }

            const response = await fetch(`${config.API_URL}/hospedajes.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: precio.id,
                    precio: nuevoPrecio
                })
            });

            if (!response.ok) throw new Error('Error al actualizar precio');
            
            const data = await response.json();
            if (data.success) {
                notify.success('Precio actualizado correctamente');
                setPrecios(precios.map(p => 
                    p.id === precio.id ? { ...p, precio: nuevoPrecio } : p
                ));
                cancelarEdicion();
            } else {
                throw new Error(data.error || 'Error al actualizar precio');
            }
        } catch (error) {
            console.error('Error:', error);
            notify.error('Error al actualizar el precio');
        }
    };

    const getIconoMetodoPago = (metodoPago) => {
        switch (metodoPago) {
            case 'efectivo':
                return <FaMoneyBillWave className="icono-efectivo" />;
            case 'transferencia':
                return <FaCreditCard className="icono-transferencia" />;
            default:
                return <FaMoneyBillWave />;
        }
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(precio);
    };

    if (loading) {
        return (
            <div className="gestion-precios">
                <div className="loading">Cargando precios...</div>
            </div>
        );
    }

    return (
        <div className="gestion-precios">
            <div className="gestion-precios-header">
                <h2><FaMoneyBillWave /> Gestión de Precios</h2>
                <p>Modifica los precios de hospedaje según el método de pago</p>
            </div>

            {/* Precios de Camping */}
            <div className="seccion-precios">
                <h3 className="seccion-titulo">🏕️ Precios de Camping</h3>
                <div className="precios-grid">
                    {precios.filter(precio => precio.tipo_tabla === 'camping').map(precio => (
                        <div key={precio.id} className="precio-card precio-camping">
                            <div className="precio-header">
                                <h3>{precio.tipo_hospedaje_nombre}</h3>
                                <div className="precio-info">
                                    <span className="tipo-precio-camping">
                                        <FaUsers /> {precio.descripcion}
                                    </span>
                                    <span className="metodo-pago">
                                        {getIconoMetodoPago(precio.metodo_pago)} {precio.metodo_pago}
                                    </span>
                                </div>
                            </div>

                            <div className="precio-content">
                                {editandoId === precio.id ? (
                                    <div className="edicion-precio">
                                        <input
                                            type="number"
                                            value={precioEditando}
                                            onChange={(e) => setPrecioEditando(e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="input-precio"
                                        />
                                        <div className="botones-edicion">
                                            <button
                                                onClick={() => guardarPrecio(precio)}
                                                className="btn-guardar"
                                            >
                                                <FaSave /> Guardar
                                            </button>
                                            <button
                                                onClick={cancelarEdicion}
                                                className="btn-cancelar"
                                            >
                                                <FaTimes /> Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="precio-display">
                                        <span className="precio-valor">
                                            {formatearPrecio(precio.precio)}
                                        </span>
                                        <button
                                            onClick={() => iniciarEdicion(precio)}
                                            className="btn-editar"
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Precios de Hospedaje */}
            <div className="seccion-precios">
                <h3 className="seccion-titulo">🏠 Precios de Hospedaje</h3>
                <div className="precios-grid">
                    {precios.filter(precio => precio.tipo_tabla === 'hospedaje').map(precio => (
                        <div key={precio.id} className="precio-card">
                            <div className="precio-header">
                                <h3>{precio.tipo_hospedaje_nombre}</h3>
                                <div className="precio-info">
                                    <span className="cantidad-personas">
                                        <FaUsers /> {precio.cantidad_personas} {precio.cantidad_personas === 1 ? 'persona' : 'personas'}
                                    </span>
                                    <span className="metodo-pago">
                                        {getIconoMetodoPago(precio.metodo_pago)} {precio.metodo_pago}
                                    </span>
                                </div>
                            </div>

                            <div className="precio-content">
                                {editandoId === precio.id ? (
                                    <div className="edicion-precio">
                                        <input
                                            type="number"
                                            value={precioEditando}
                                            onChange={(e) => setPrecioEditando(e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="input-precio"
                                        />
                                        <div className="botones-edicion">
                                            <button
                                                onClick={() => guardarPrecio(precio)}
                                                className="btn-guardar"
                                            >
                                                <FaSave /> Guardar
                                            </button>
                                            <button
                                                onClick={cancelarEdicion}
                                                className="btn-cancelar"
                                            >
                                                <FaTimes /> Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="precio-display">
                                        <span className="precio-valor">
                                            {formatearPrecio(precio.precio)}
                                        </span>
                                        <button
                                            onClick={() => iniciarEdicion(precio)}
                                            className="btn-editar"
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {precios.length === 0 && (
                <div className="no-precios">
                    <p>No hay precios configurados</p>
                </div>
            )}

            {precios.filter(precio => precio.tipo_tabla === 'camping').length === 0 && (
                <div className="no-precios">
                    <p>No hay precios de camping configurados</p>
                </div>
            )}

            {precios.filter(precio => precio.tipo_tabla === 'hospedaje').length === 0 && (
                <div className="no-precios">
                    <p>No hay precios de hospedaje configurados</p>
                </div>
            )}
        </div>
    );
};

export default GestionPrecios; 