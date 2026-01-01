import React from 'react';
import { useReservaRapida } from './hooks/useReservaRapida';
import DatosCliente from './components/DatosCliente';
import DatosReserva from './components/DatosReserva';
import AccionesFormulario from './components/AccionesFormulario';
import InfoPanel from './components/InfoPanel';
import './ReservaRapida.css';

const ReservaRapidaRefactorizada = () => {
    const {
        // Estados
        formData,
        tiposHospedaje,
        hospedajesDisponibles,
        cantidadesDisponibles,
        loading,
        clienteExistente,
        verificandoDisponibilidad,
        calculandoPrecio,
        subtotal,
        cantidadAdultos,
        cantidadMenores,
        cantidadNoches,
        
        // Funciones
        handleInputChange,
        handleSubmit,
        limpiarFormulario,
        getTipoHospedajeNombre,
        formatearNumeroHospedaje,
        handleCantidadAdultosChange,
        handleCantidadMenoresChange
    } = useReservaRapida();

    return (
        <div className="reserva-rapida-container">
            <div className="reserva-rapida-header">
                <h1>🔄 Reserva Rápida</h1>
                <p>Ingresa cliente y reserva en una sola pantalla</p>
            </div>

            <form onSubmit={handleSubmit} className="reserva-rapida-form">
                <div className="form-grid">
                    {/* Sección Cliente */}
                    <DatosCliente 
                        formData={formData}
                        clienteExistente={clienteExistente}
                        handleInputChange={handleInputChange}
                    />

                    {/* Sección Reserva */}
                    <DatosReserva 
                        formData={formData}
                        tiposHospedaje={tiposHospedaje}
                        hospedajesDisponibles={hospedajesDisponibles}
                        cantidadesDisponibles={cantidadesDisponibles}
                        verificandoDisponibilidad={verificandoDisponibilidad}
                        calculandoPrecio={calculandoPrecio}
                        subtotal={subtotal}
                        cantidadAdultos={cantidadAdultos}
                        cantidadMenores={cantidadMenores}
                        cantidadNoches={cantidadNoches}
                        handleInputChange={handleInputChange}
                        getTipoHospedajeNombre={getTipoHospedajeNombre}
                        formatearNumeroHospedaje={formatearNumeroHospedaje}
                        handleCantidadAdultosChange={handleCantidadAdultosChange}
                        handleCantidadMenoresChange={handleCantidadMenoresChange}
                    />
                </div>

                {/* Acciones del formulario */}
                <AccionesFormulario 
                    loading={loading}
                    limpiarFormulario={limpiarFormulario}
                />
            </form>

            {/* Panel de información */}
            <InfoPanel />
        </div>
    );
};

export default ReservaRapidaRefactorizada;
