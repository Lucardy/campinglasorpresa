import React from 'react';
import { FaTimes, FaSave, FaUndo } from 'react-icons/fa';
import { useEditarReserva } from './hooks/useEditarReserva';
import FormularioDatosReserva from './components/FormularioDatosReserva';
import SelectorHospedaje from './components/SelectorHospedaje';
import CalculadoraPrecio from './components/CalculadoraPrecio';
import GestionPagosSection from './components/GestionPagosSection';
import './EditarReservaModal.css';

const EditarReservaModal = ({ reserva, isOpen, onClose, onReservaUpdated, onRefresh, onPagoActualizado }) => {
    const {
        // Estados
        formData,
        cantidadAdultos,
        cantidadMenores,
        loading,
        error,
        tiposHospedaje,
        hospedajes,
        hospedajesDisponibles,
        loadingHospedajes,
        tipoHospedajeSeleccionado,
        tipoHospedajeNombre,
        hospedajeSeleccionado,
        refreshReserva,
        setRefreshReserva,
        desglosePrecio,
        getTodayStart,
        
        // Funciones
        handleInputChange,
        handleFechaChange,
        handleTipoHospedajeChange,
        handleHospedajeChange,
        handleCantidadAdultosChange,
        handleCantidadMenoresChange,
        handleSubmit,
        handleCancel
    } = useEditarReserva(reserva, isOpen, onReservaUpdated, onRefresh, onClose);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    const getClienteNombre = () => {
        return `${reserva?.apellido}, ${reserva?.nombre}`;
    };

    const getHospedajeNombre = () => {
        return `${reserva?.tipo_hospedaje} ${reserva?.numero_hospedaje}`;
    };

    if (!isOpen || !reserva) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="editar-reserva-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="editar-reserva-modal-header">
                    <h2>Editar Reserva</h2>
                    <button className="editar-reserva-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="editar-reserva-modal-body">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="reserva-info-summary">
                        <h3>Información de la Reserva</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>Cliente:</strong> {getClienteNombre()}
                            </div>
                            <div className="info-item">
                                <strong>Hospedaje:</strong> {getHospedajeNombre()}
                            </div>
                            <div className="info-item">
                                <strong>Estado:</strong> {reserva.estado || 'Activa'}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="editar-reserva-form">
                        {/* Formulario de Datos Básicos */}
                        <FormularioDatosReserva
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleFechaChange={handleFechaChange}
                            cantidadAdultos={cantidadAdultos}
                            cantidadMenores={cantidadMenores}
                            handleCantidadAdultosChange={handleCantidadAdultosChange}
                            handleCantidadMenoresChange={handleCantidadMenoresChange}
                            tipoHospedajeNombre={tipoHospedajeNombre}
                            reserva={reserva}
                        />

                        {/* Selector de Hospedaje */}
                        <SelectorHospedaje
                            tiposHospedaje={tiposHospedaje}
                            tipoHospedajeSeleccionado={tipoHospedajeSeleccionado}
                            tipoHospedajeNombre={tipoHospedajeNombre}
                            handleTipoHospedajeChange={handleTipoHospedajeChange}
                            hospedajesDisponibles={hospedajesDisponibles}
                            hospedajeSeleccionado={hospedajeSeleccionado}
                            handleHospedajeChange={handleHospedajeChange}
                            loadingHospedajes={loadingHospedajes}
                        />

                        {/* Calculadora de Precio */}
                        <div className="form-section">
                            <CalculadoraPrecio
                                desglosePrecio={desglosePrecio}
                                tipoHospedajeNombre={tipoHospedajeNombre}
                                reserva={reserva}
                                cantidadAdultos={cantidadAdultos}
                                cantidadMenores={cantidadMenores}
                                formData={formData}
                            />
                        </div>

                        {/* Estado */}
                        <div className="form-section">
                            <h4>Estado</h4>
                            <div className="form-group">
                                <select
                                    id="estado"
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange('estado', e.target.value)}
                                    required
                                >
                                    <option value="activa">Activa</option>
                                    <option value="finalizada">Finalizada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>
                        </div>

                        {/* Gestión de Pagos */}
                        <GestionPagosSection
                                reservaId={reserva.id}
                                montoTotal={formData.monto_total}
                            onPagoActualizado={onPagoActualizado}
                            onRefresh={onRefresh}
                            setRefreshReserva={setRefreshReserva}
                            />

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                <FaUndo /> Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn-save"
                                disabled={loading}
                            >
                                <FaSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarReservaModal; 
