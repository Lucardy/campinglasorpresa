import React from 'react';
import './FormHeader.css';

const FormHeader = ({ pasoActual }) => {
    const getTitulo = () => {
        switch (pasoActual) {
            case 1:
                return 'Selecciona las fechas';
            case 2:
                return 'Elige el hospedaje';
            case 3:
                return 'Detalles de la reserva';
            case 4:
                return 'Selecciona el cliente';
            default:
                return 'Nueva Reserva';
        }
    };

    const getDescripcion = () => {
        switch (pasoActual) {
            case 1:
                return 'Selecciona las fechas de entrada y salida para tu reserva';
            case 2:
                return 'Elige el tipo de hospedaje y la unidad que prefieras';
            case 3:
                return 'Ingresa los detalles adicionales de tu reserva';
            case 4:
                return 'Busca y selecciona el cliente para la reserva';
            default:
                return 'Completa el formulario para crear una nueva reserva';
        }
    };

    return (
        <div className="form-header">
            <h2>{getTitulo()}</h2>
            <p>{getDescripcion()}</p>
        </div>
    );
};

export default FormHeader; 