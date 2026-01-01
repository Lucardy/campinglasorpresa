import React from 'react';
import './StepIndicator.css';

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { number: 1, label: 'Fechas' },
        { number: 2, label: 'Hospedaje' },
        { number: 3, label: 'Detalles' },
        { number: 4, label: 'Cliente' }
    ];

    return (
        <div className="step-indicator">
            {steps.map((step, index) => (
                <div key={step.number} className="step-container">
                    <div className={`step ${currentStep >= step.number ? 'active' : ''}`}>
                        {step.number}
                    </div>
                    <span className="step-label">{step.label}</span>
                    {index < steps.length - 1 && (
                        <div className={`step-line ${currentStep > step.number ? 'active' : ''}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default StepIndicator; 