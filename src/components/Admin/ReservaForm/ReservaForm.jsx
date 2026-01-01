import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useReservaForm from './hooks/useReservaForm';
import PasoFechas from './PasoFechas';
import PasoHospedaje from './PasoHospedaje';
import PasoDetalles from './PasoDetalles';
import PasoCliente from './PasoCliente';
import FormHeader from './FormHeader';
import StepIndicator from './StepIndicator';
import NavigationButtons from './NavigationButtons';
import LocaleProvider from './LocaleProvider';
import './ReservaForm.css';

const ReservaForm = ({ onClose, onSuccess, clientes = [] }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const {
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
    } = useReservaForm(clientes);

    const steps = [
        { id: 1, title: 'Fechas', component: PasoFechas },
        { id: 2, title: 'Hospedaje', component: PasoHospedaje },
        { id: 3, title: 'Detalles', component: PasoDetalles },
        { id: 4, title: 'Cliente', component: PasoCliente }
    ];

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const onSubmit = async (e) => {
        const result = await handleSubmit(e);
        if (result.success) {
            console.log('✅ ReservaForm: Reserva creada exitosamente');
            // No llamamos onSuccess porque la reserva ya se creó en handleSubmit
            // Solo cerramos el formulario
            onClose();
        }
    };

    const CurrentStepComponent = steps[currentStep - 1].component;

    const getStepProps = () => {
        switch (currentStep) {
            case 1:
                return {
                    formData,
                    onFechaChange: handleFechaChange,
                    onNext: handleNext
                };
            case 2:
                return {
                    formData,
                    tiposHospedaje,
                    hospedajes,
                    disponibilidad,
                    tipoHospedajeSeleccionado,
                    tipoHospedajeNombre,
                    onTipoHospedajeChange: handleTipoHospedajeChange,
                    onInputChange: handleChange,
                    onNext: handleNext,
                    onBack: handleBack,
                    error
                };
            case 3:
                return {
                    formData,
                    onInputChange: handleChange,
                    onNext: handleNext,
                    onBack: handleBack,
                    tipoHospedajeSeleccionado,
                    tipoHospedajeNombre
                };
            case 4:
                return {
                    searchTerm,
                    filteredClientes,
                    showResults,
                    selectedCliente,
                    loading,
                    onSearchChange: handleSearchChange,
                    onClienteSelect: handleClienteSelect,
                    onSubmit,
                    onBack: handleBack
                };
            default:
                return {};
        }
    };

    return (
        <LocaleProvider>
            <div className="reserva-form-container" onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}>
                <div className="reserva-form" onClick={e => e.stopPropagation()}>
                    <button 
                        className="close-button"
                        onClick={onClose}
                        aria-label="Cerrar formulario"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <FormHeader 
                        title="Nueva Reserva"
                        subtitle={`Paso ${currentStep} de ${steps.length}: ${steps[currentStep - 1].title}`}
                    />
                    
                    <StepIndicator 
                        currentStep={currentStep}
                        steps={steps}
                    />
                    
                    <div className="form-content">
                        {error && <div className="error-message">{error}</div>}
                        
                        <CurrentStepComponent {...getStepProps()} />
                    </div>
                </div>
            </div>
        </LocaleProvider>
    );
};

export default ReservaForm; 