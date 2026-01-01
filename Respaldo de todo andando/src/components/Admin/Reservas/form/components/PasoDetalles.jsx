import React, { useEffect, useState } from 'react';
import './PasoDetalles.css';
import { notify } from '../Notifications/NotificationSystem';
import config from '../../../config';

const PasoDetalles = ({ 
    formData, 
    onInputChange, 
    onNext,
    onBack,
    tipoHospedajeSeleccionado,
    tipoHospedajeNombre
}) => {
    const [opcionesPersonas, setOpcionesPersonas] = useState([]);
    const [desglosePrecio, setDesglosePrecio] = useState({
        precioPorPersona: 0,
        cantidadDias: 0,
        subtotal: 0
    });

    useEffect(() => {
        const fetchCantidadesPersonas = async () => {
            try {
                const response = await fetch(`${config.API_URL}/hospedajes.php?cantidades_personas&tipo_hospedaje_id=${tipoHospedajeSeleccionado}`);
                if (!response.ok) throw new Error('Error al cargar cantidades de personas');
                const data = await response.json();
                
                if (data.success && Array.isArray(data.cantidades)) {
                    setOpcionesPersonas(data.cantidades);
                }
            } catch (error) {
                console.error('Error:', error);
                notify.error('Error al cargar cantidades de personas');
            }
        };

        fetchCantidadesPersonas();
    }, [tipoHospedajeSeleccionado]);

    useEffect(() => {
        const fetchPrecio = async () => {
            if (tipoHospedajeSeleccionado && formData.cantidad_personas && formData.fecha_entrada && formData.fecha_salida) {
                try {
                    const response = await fetch(`${config.API_URL}/hospedajes.php?precio&tipo_hospedaje_id=${tipoHospedajeSeleccionado}&cantidad_personas=${formData.cantidad_personas}`);
                    if (!response.ok) throw new Error('Error al cargar precio');
                    const data = await response.json();
                    
                    if (data.success && data.precio) {
                        const fechaEntrada = new Date(formData.fecha_entrada);
                        const fechaSalida = new Date(formData.fecha_salida);
                        const diffTime = Math.abs(fechaSalida - fechaEntrada);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        setDesglosePrecio({
                            precioPorPersona: data.precio,
                            cantidadDias: diffDays,
                            subtotal: data.precio * diffDays
                        });
                    }
                } catch (error) {
                    console.error('Error:', error);
                    notify.error('Error al cargar precio');
                }
            }
        };

        fetchPrecio();
    }, [tipoHospedajeSeleccionado, formData.cantidad_personas, formData.fecha_entrada, formData.fecha_salida]);

    const handleCantidadPersonasChange = (e) => {
        const { value } = e.target;
        onInputChange(e);
    };

    return (
        <div className="paso-detalles">
            <div className="form-group">
                <label htmlFor="cantidad_personas">Cantidad de Personas *</label>
                <select
                    id="cantidad_personas"
                    name="cantidad_personas"
                    value={formData.cantidad_personas}
                    onChange={handleCantidadPersonasChange}
                    required
                    className="form-select"
                >
                    <option value="">Seleccione cantidad de personas</option>
                    {opcionesPersonas.map(cantidad => (
                        <option key={cantidad} value={cantidad}>
                            {cantidad} {cantidad === 1 ? 'persona' : 'personas'}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="monto_total">Monto Total *</label>
                <input
                    type="number"
                    id="monto_total"
                    name="monto_total"
                    value={formData.monto_total}
                    onChange={onInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="form-input"
                    readOnly
                />
                {desglosePrecio.precioPorPersona > 0 && (
                    <div className="desglose-precio">
                        <p>Desglose del monto:</p>
                        <ul>
                            <li>Precio por persona por día: ${desglosePrecio.precioPorPersona.toLocaleString()}</li>
                            <li>Cantidad de personas: {formData.cantidad_personas}</li>
                            <li>Cantidad de días: {desglosePrecio.cantidadDias}</li>
                            <li>Subtotal: ${desglosePrecio.subtotal.toLocaleString()}</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="metodo_pago">Método de Pago *</label>
                <select
                    id="metodo_pago"
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={onInputChange}
                    required
                    className="form-select"
                >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                    id="observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={onInputChange}
                    rows="3"
                    className="form-textarea"
                />
            </div>

            <div className="form-actions">
                <button 
                    type="button" 
                    className="btn-back"
                    onClick={onBack}
                >
                    Volver
                </button>
                <button 
                    type="button" 
                    className="btn-next"
                    onClick={onNext}
                    disabled={!formData.cantidad_personas || !formData.monto_total || !formData.metodo_pago}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};

export default PasoDetalles; 