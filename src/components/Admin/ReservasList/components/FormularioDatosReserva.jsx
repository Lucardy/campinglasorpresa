import React from 'react';
import { FaCalendar, FaUsers, FaMoneyBillWave, FaComment, FaPercent } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { formatDate, parseLocalDate } from '../../../../utils/dateUtils';
import es from 'date-fns/locale/es';

/**
 * Componente para los campos básicos del formulario de edición de reserva
 */
const FormularioDatosReserva = ({
    formData,
    handleInputChange,
    handleFechaChange,
    cantidadAdultos,
    cantidadMenores,
    handleCantidadAdultosChange,
    handleCantidadMenoresChange,
    tipoHospedajeNombre,
    reserva
}) => {
    const esCamping = tipoHospedajeNombre?.toLowerCase() === 'camping' || 
                     (tipoHospedajeNombre === '' && reserva?.tipo_hospedaje === 'camping');

    return (
        <>
            {/* Sección de Fechas */}
            <div className="form-section">
                <h4><FaCalendar /> Fechas</h4>
                <div className="date-picker-container">
                    <DatePicker
                        selected={formData.fecha_entrada ? parseLocalDate(formData.fecha_entrada) : null}
                        onChange={handleFechaChange}
                        startDate={formData.fecha_entrada ? parseLocalDate(formData.fecha_entrada) : null}
                        endDate={formData.fecha_salida ? parseLocalDate(formData.fecha_salida) : null}
                        selectsRange
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
                <div className="selected-dates">
                    <div className="date-item">
                        <strong>Entrada:</strong> {formData.fecha_entrada ? formatDate(formData.fecha_entrada) : 'No seleccionada'}
                    </div>
                    <div className="date-item">
                        <strong>Salida:</strong> {formData.fecha_salida ? formatDate(formData.fecha_salida) : 'No seleccionada'}
                    </div>
                </div>
            </div>

            {/* Sección de Detalles (Cantidad de Personas) */}
            <div className="form-section">
                <h4><FaUsers /> Detalles</h4>
                {esCamping ? (
                    <>
                        <div className="camping-info-message">
                            <p>
                                <strong>💡 Nota importante:</strong> La base de datos solo guarda la cantidad total de personas. 
                                Por favor, aclara la distribución correcta de adultos y menores para calcular el precio exacto.
                            </p>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="cantidad_adultos">Adultos</label>
                                <input
                                    type="number"
                                    id="cantidad_adultos"
                                    value={cantidadAdultos}
                                    onChange={handleCantidadAdultosChange}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cantidad_menores">Menores</label>
                                <input
                                    type="number"
                                    id="cantidad_menores"
                                    value={cantidadMenores}
                                    onChange={handleCantidadMenoresChange}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="monto_total">Monto Total</label>
                                <input
                                    type="number"
                                    id="monto_total"
                                    value={formData.monto_total}
                                    onChange={(e) => handleInputChange('monto_total', e.target.value)}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cantidad_personas">Cantidad de Personas</label>
                            <input
                                type="number"
                                id="cantidad_personas"
                                value={formData.cantidad_personas}
                                onChange={(e) => handleInputChange('cantidad_personas', e.target.value)}
                                min="1"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="monto_total">Monto Total</label>
                            <input
                                type="number"
                                id="monto_total"
                                value={formData.monto_total}
                                onChange={(e) => handleInputChange('monto_total', e.target.value)}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Sección de Pago */}
            <div className="form-section">
                <h4><FaMoneyBillWave /> Pago</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="metodo_pago">Método de Pago</label>
                        <select
                            id="metodo_pago"
                            value={formData.metodo_pago}
                            onChange={(e) => handleInputChange('metodo_pago', e.target.value)}
                            required
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="descuento">
                            <FaPercent /> Seña
                        </label>
                        <input
                            type="number"
                            id="descuento"
                            value={formData.descuento}
                            onChange={(e) => handleInputChange('descuento', e.target.value)}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Sección de Observaciones */}
            <div className="form-section">
                <h4><FaComment /> Observaciones</h4>
                <div className="form-group">
                    <textarea
                        id="observaciones"
                        value={formData.observaciones}
                        onChange={(e) => handleInputChange('observaciones', e.target.value)}
                        rows="3"
                        placeholder="Observaciones adicionales..."
                    />
                </div>
            </div>
        </>
    );
};

export default FormularioDatosReserva;

