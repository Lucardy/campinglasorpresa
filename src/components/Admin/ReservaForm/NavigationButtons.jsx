import React from 'react';
import './NavigationButtons.css';

const NavigationButtons = ({ 
    currentStep, 
    totalSteps, 
    onBack, 
    onNext, 
    onSubmit,
    isLoading 
}) => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="navigation-buttons">
            {!isFirstStep && (
                <button
                    type="button"
                    className="nav-button back-button"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M12.5 15L7.5 10L12.5 5" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                    Anterior
                </button>
            )}
            
            {isLastStep ? (
                <button
                    type="submit"
                    className="nav-button submit-button"
                    onClick={onSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg 
                                className="loading-spinner" 
                                width="20" 
                                height="20" 
                                viewBox="0 0 20 20" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round"
                                />
                            </svg>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 20 20" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    d="M8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" 
                                    fill="currentColor"
                                />
                            </svg>
                            Guardar Reserva
                        </>
                    )}
                </button>
            ) : (
                <button
                    type="button"
                    className="nav-button next-button"
                    onClick={onNext}
                    disabled={isLoading}
                >
                    Siguiente
                    <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M7.5 5L12.5 10L7.5 15" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default NavigationButtons; 