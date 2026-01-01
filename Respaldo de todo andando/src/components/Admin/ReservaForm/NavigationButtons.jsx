import React from 'react';

const NavigationButtons = ({ 
    onBack, 
    onNext, 
    isNextDisabled = false,
    isLastStep = false,
    onSubmit,
    loading = false
}) => {
    return (
        <div className="navigation-buttons">
            {onBack && (
                <button
                    type="button"
                    className="btn-back"
                    onClick={onBack}
                >
                    Volver
                </button>
            )}
            
            {isLastStep ? (
                <button
                    type="submit"
                    className="btn-submit"
                    onClick={onSubmit}
                    disabled={isNextDisabled || loading}
                >
                    {loading ? 'Guardando...' : 'Guardar Reserva'}
                </button>
            ) : (
                <button
                    type="button"
                    className="btn-next"
                    onClick={onNext}
                    disabled={isNextDisabled}
                >
                    Siguiente
                </button>
            )}
        </div>
    );
};

export default NavigationButtons; 