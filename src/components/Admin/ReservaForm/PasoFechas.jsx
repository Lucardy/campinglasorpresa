import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './PasoFechas.css';
import es from 'date-fns/locale/es';

const PasoFechas = ({ formData, onFechaChange, onNext }) => {
    // Crear fecha mínima permitida: hasta 2 días anteriores (3 si es antes de las 6:00am)
    const getTodayStart = () => {
        const now = new Date();
        const horaActual = now.getHours();
        const fechaMinima = new Date();
        fechaMinima.setHours(0, 0, 0, 0);
        
        // Permitir hasta 2 días anteriores como mínimo
        fechaMinima.setDate(fechaMinima.getDate() - 2);
        
        // Si es antes de las 6:00am, permitir un día adicional (hasta 3 días anteriores)
        if (horaActual < 6) {
            fechaMinima.setDate(fechaMinima.getDate() - 1);
        }
        
        return fechaMinima;
    };

    const handleNext = () => {
        if (!formData.fecha_entrada || !formData.fecha_salida) {
            return;
        }
        onNext();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                    minDate={getTodayStart()}
                    dateFormat="dd/MM/yyyy"
                    inline
                    monthsShown={2}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    className="calendar"
                    locale={es}
                />
            </div>

            {formData.fecha_entrada && formData.fecha_salida && (
            <div className="fechas-seleccionadas">
                    <div className="fechas-info">
                        <p>
                            <strong>Entrada:</strong>
                            <span>{formatDate(formData.fecha_entrada)}</span>
                        </p>
                        <p>
                            <strong>Salida:</strong>
                            <span>{formatDate(formData.fecha_salida)}</span>
                        </p>
                    </div>
                    </div>
                )}

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