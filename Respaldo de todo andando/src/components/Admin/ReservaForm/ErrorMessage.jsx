import React from 'react';

const ErrorMessage = ({ message, type = 'error' }) => {
    if (!message) return null;

    return (
        <div className={`message ${type}`}>
            {message}
        </div>
    );
};

export default ErrorMessage; 