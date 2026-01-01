import React from 'react';
import './FormHeader.css';

const FormHeader = ({ title, subtitle }) => {
    return (
        <div className="form-header">
            <div className="header-content">
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
        </div>
    );
};

export default FormHeader; 