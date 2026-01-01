import React from 'react';
import './StepIndicator.css';

const StepIndicator = ({ currentStep, steps }) => {
    return (
        <div className="step-indicator">
            {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const stepClass = `step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;

                return (
                    <div key={step.id} className={stepClass}>
                        <div className="step-number">
                            {isCompleted ? (
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
                            ) : (
                                step.id
                            )}
                        </div>
                        <span className="step-label">{step.title}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default StepIndicator; 