import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './PasoFechas.css';

const PasoFechas = ({ formData, onFechaChange, onNext }) => {
    const handleNext = () => {
        if (!formData.fecha_entrada || !formData.fecha_salida) {
            return;
        }
        onNext();
    };

    return (
        <div className="paso-fechas">
            <div className="calendar-container">
                <DatePicker
                    selected={formData.fecha_entrada ? new Date(formData.fecha_entrada) : null}
                    onChange={onFechaChange}
                    startDate={formData.fecha_entrada ? new Date(formData.fecha_entrada) : null}
                    endDate={formData.fecha_salida ? new Date(formData.fecha_salida) : null}
                    selectsRange
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    inline
                    monthsShown={2}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    className="calendar"
                />
            </div>

            <div className="fechas-seleccionadas">
                {formData.fecha_entrada && formData.fecha_salida && (
                    <div className="fechas-info">
                        <p>
                            <strong>Entrada:</strong> {new Date(formData.fecha_entrada).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Salida:</strong> {new Date(formData.fecha_salida).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            <div className="form-actions">
                <button
                    type="button"
                    className="btn-next"
                    onClick={handleNext}
                    disabled={!formData.fecha_entrada || !formData.fecha_salida}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default PasoFechas; 