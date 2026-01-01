import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import useReservaForm from './hooks/useReservaForm';
import FormHeader from './FormHeader';
import PasoFechas from './PasoFechas';
import PasoHospedaje from './PasoHospedaje';
import PasoDetalles from './PasoDetalles';
import PasoCliente from './PasoCliente';
import StepIndicator from './StepIndicator';
import ErrorMessage from './ErrorMessage';
import NavigationButtons from './NavigationButtons';
import './ReservaForm.css';

const ReservaForm = ({ onClose, onReservaAdded }) => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const {
        pasoActual,
        setPasoActual,
        formData,
        searchTerm,
        filteredClientes,
        showResults,
        tiposHospedaje,
        hospedajes,
        disponibilidad,
        error,
        loading,
        tipoHospedajeSeleccionado,
        tipoHospedajeNombre,
        selectedCliente,
        handleFechaChange,
        handleTipoHospedajeChange,
        handleChange,
        handleSearchChange,
        handleClienteSelect,
        handleSubmit
    } = useReservaForm();

    const handleNext = () => {
        setPasoActual(prev => prev + 1);
    };

    const handleBack = () => {
        setPasoActual(prev => prev - 1);
    };

    const onSubmit = async (e) => {
        const result = await handleSubmit(e);
        if (result.success) {
            setSuccessMessage('Reserva creada exitosamente');
            if (onReservaAdded) {
                onReservaAdded();
            }
            setTimeout(() => {
                onClose();
            }, 2000);
        }
    };

    const renderPaso = () => {
        switch (pasoActual) {
            case 1:
                return (
                    <PasoFechas
                        formData={formData}
                        onFechaChange={handleFechaChange}
                        onNext={handleNext}
                    />
                );
            case 2:
                return (
                    <PasoHospedaje
                        formData={formData}
                        tiposHospedaje={tiposHospedaje}
                        hospedajes={hospedajes}
                        disponibilidad={disponibilidad}
                        tipoHospedajeSeleccionado={tipoHospedajeSeleccionado}
                        tipoHospedajeNombre={tipoHospedajeNombre}
                        onTipoHospedajeChange={handleTipoHospedajeChange}
                        onInputChange={handleChange}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 3:
                return (
                    <PasoDetalles
                        formData={formData}
                        onInputChange={handleChange}
                        onNext={handleNext}
                        onBack={handleBack}
                        tipoHospedajeSeleccionado={tipoHospedajeSeleccionado}
                        tipoHospedajeNombre={tipoHospedajeNombre}
                    />
                );
            case 4:
                return (
                    <PasoCliente
                        searchTerm={searchTerm}
                        filteredClientes={filteredClientes}
                        showResults={showResults}
                        selectedCliente={selectedCliente}
                        loading={loading}
                        onSearchChange={handleSearchChange}
                        onClienteSelect={handleClienteSelect}
                        onSubmit={onSubmit}
                        onBack={handleBack}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="reserva-form-container">
            <form className="reserva-form" onSubmit={onSubmit}>
                <FormHeader pasoActual={pasoActual} />
                <StepIndicator currentStep={pasoActual} />
                
                <div className="form-content">
                    <ErrorMessage message={error} type="error" />
                    <ErrorMessage message={successMessage} type="success" />
                    {renderPaso()}
                </div>
            </form>
        </div>
    );
};

export default ReservaForm; 