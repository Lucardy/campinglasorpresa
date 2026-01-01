import React, { useEffect, useState } from 'react';
import { FaUsers, FaMoneyBillWave, FaCreditCard, FaComment, FaChild, FaUser, FaPercent } from 'react-icons/fa';
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
        precioBase: 0,
        precioAdultos: 0,
        precioMenores: 0,
        precioPorDia: 0,
        cantidadDias: 0,
        subtotal: 0
    });
    const [cantidadAdultos, setCantidadAdultos] = useState('');
    const [cantidadMenores, setCantidadMenores] = useState('');
    const [descuento, setDescuento] = useState('');
    const [montoOriginalGrupo, setMontoOriginalGrupo] = useState(0);

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
            if (tipoHospedajeSeleccionado && formData.fecha_entrada && formData.fecha_salida) {
                try {
                    // Si es grupos, solo calcular días y no hacer nada más
                    if (tipoHospedajeSeleccionado === '4') {
                        const fechaEntrada = new Date(formData.fecha_entrada);
                        const fechaSalida = new Date(formData.fecha_salida);
                        const diffTime = Math.abs(fechaSalida - fechaEntrada);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        setDesglosePrecio({
                            precioBase: 0,
                            precioAdultos: 0,
                            precioMenores: 0,
                            precioPorDia: 0,
                            cantidadDias: diffDays,
                            subtotal: 0
                        });
                        return;
                    }

                    // Si es camping, calcular precio basado en adultos y menores
                    if (tipoHospedajeSeleccionado === '3') {
                        // Obtener el método de pago actual del formData
                        const metodoPago = formData.metodo_pago || 'efectivo';
                        
                        // Obtener los precios base de camping
                        const response = await fetch(`${config.API_URL}/hospedajes.php?precios_camping&metodo_pago=${metodoPago}`);
                        
                        if (!response.ok) {
                            throw new Error(`Error del servidor: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        
                        if (!data.success) {
                            throw new Error(data.error || 'Error al cargar precios de camping');
                        }

                        if (!data.precios || !data.precios.base || !data.precios.adulto || !data.precios.menor) {
                            throw new Error('Faltan precios necesarios para el cálculo');
                        }

                        const precios = data.precios;
                        const fechaEntrada = new Date(formData.fecha_entrada);
                        const fechaSalida = new Date(formData.fecha_salida);
                        const diffTime = Math.abs(fechaSalida - fechaEntrada);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        // Calcular precios individuales usando los valores actuales
                        const precioBase = parseFloat(precios.base);
                        const adultos = cantidadAdultos === '' ? 0 : parseInt(cantidadAdultos);
                        const menores = cantidadMenores === '' ? 0 : parseInt(cantidadMenores);
                        const precioAdultos = adultos * parseFloat(precios.adulto);
                        const precioMenores = menores * parseFloat(precios.menor);
                        const precioPorDia = precioBase + precioAdultos + precioMenores;
                        const subtotal = precioPorDia * diffDays;
                        const descuentoValue = descuento === '' ? 0 : parseInt(descuento);
                        const total = Math.max(0, subtotal - descuentoValue); // Evitar valores negativos
                        
                        setDesglosePrecio({
                            precioBase,
                            precioAdultos,
                            precioMenores,
                            precioPorDia,
                            cantidadDias: diffDays,
                            subtotal: subtotal,
                            descuento: descuentoValue,
                            total: total
                        });

                        // Actualizar el monto total en el formulario
                        onInputChange({
                            target: {
                                name: 'monto_total',
                                value: total
                            }
                        });
                    } else {
                        // Para otros tipos de hospedaje
                        if (!formData.cantidad_personas) return;
                        
                        // Obtener el método de pago actual del formData
                        const metodoPago = formData.metodo_pago || 'efectivo';
                        
                        const response = await fetch(`${config.API_URL}/hospedajes.php?precio&tipo_hospedaje_id=${tipoHospedajeSeleccionado}&cantidad_personas=${formData.cantidad_personas}&metodo_pago=${metodoPago}`);
                        
                        if (!response.ok) {
                            throw new Error(`Error del servidor: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        
                        if (!data.success) {
                            throw new Error(data.error || 'Error al cargar precio');
                        }

                        if (!data.precio) {
                            throw new Error('No se encontró precio para los parámetros especificados');
                        }

                        const fechaEntrada = new Date(formData.fecha_entrada);
                        const fechaSalida = new Date(formData.fecha_salida);
                        const diffTime = Math.abs(fechaSalida - fechaEntrada);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        const subtotal = parseFloat(data.precio) * diffDays;
                        const descuentoValue = descuento === '' ? 0 : parseInt(descuento);
                        const total = Math.max(0, subtotal - descuentoValue); // Evitar valores negativos
                        
                        setDesglosePrecio({
                            precioBase: 0,
                            precioAdultos: 0,
                            precioMenores: 0,
                            precioPorDia: 0,
                            cantidadDias: diffDays,
                            subtotal: subtotal,
                            descuento: descuentoValue,
                            total: total
                        });

                        onInputChange({
                            target: {
                                name: 'monto_total',
                                value: total
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error:', error);
                    notify.error(error.message || 'Error al cargar precio');
                    // Resetear el desglose de precio en caso de error
                    setDesglosePrecio({
                        precioBase: 0,
                        precioAdultos: 0,
                        precioMenores: 0,
                        precioPorDia: 0,
                        cantidadDias: 0,
                        subtotal: 0
                    });
                    onInputChange({
                        target: {
                            name: 'monto_total',
                            value: 0
                        }
                    });
                }
            }
        };

        fetchPrecio();
    }, [tipoHospedajeSeleccionado, formData.cantidad_personas, formData.fecha_entrada, formData.fecha_salida, formData.metodo_pago, cantidadAdultos, cantidadMenores, descuento]);

    const handleCantidadPersonasChange = (e) => {
        const { value } = e.target;
        onInputChange(e);
    };

    const handleCantidadAdultosChange = (e) => {
        const value = e.target.value === '' ? '' : parseInt(e.target.value);
        setCantidadAdultos(value);
        // Actualizar la cantidad total de personas
        onInputChange({
            target: {
                name: 'cantidad_personas',
                value: (value === '' ? 0 : value) + (cantidadMenores === '' ? 0 : parseInt(cantidadMenores))
            }
        });
    };

    const handleCantidadMenoresChange = (e) => {
        const value = e.target.value === '' ? '' : parseInt(e.target.value);
        setCantidadMenores(value);
        // Actualizar la cantidad total de personas
        onInputChange({
            target: {
                name: 'cantidad_personas',
                value: (cantidadAdultos === '' ? 0 : parseInt(cantidadAdultos)) + (value === '' ? 0 : parseInt(value))
            }
        });
    };

    const handleDescuentoChange = (e) => {
        const value = e.target.value === '' ? '' : parseInt(e.target.value);
        setDescuento(value);
        onInputChange({
            target: {
                name: 'descuento',
                value: value === '' ? 0 : value
            }
        });
        
        // Actualizar el monto total con descuento
        if (tipoHospedajeSeleccionado === '4') {
            // Para grupos, aplicar descuento al monto original
            const montoOriginal = montoOriginalGrupo || parseFloat(formData.monto_total) || 0;
            const descuentoValue = value === '' ? 0 : parseFloat(value);
            const total = Math.max(0, montoOriginal - descuentoValue); // Evitar valores negativos
            onInputChange({
                target: {
                    name: 'monto_total',
                    value: total
                }
            });
        } else if (desglosePrecio.subtotal > 0) {
            // Para otros tipos, usar el subtotal calculado
            const descuentoValue = value === '' ? 0 : value;
            const total = desglosePrecio.subtotal - descuentoValue;
            onInputChange({
                target: {
                    name: 'monto_total',
                    value: total
                }
            });
            
            // Actualizar el desglose con el nuevo descuento
            setDesglosePrecio(prev => ({
                ...prev,
                descuento: descuentoValue,
                total: total
            }));
        }
    };



    const handleMetodoPagoChange = (e) => {
        onInputChange(e);
        // El precio se recalculará automáticamente en el useEffect
    };

    const handleMontoTotalGrupoChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setMontoOriginalGrupo(value);
        
        // Aplicar descuento si existe
        if (descuento !== '' && descuento > 0) {
            const descuentoValue = parseFloat(descuento);
            const total = Math.max(0, value - descuentoValue); // Evitar valores negativos
            onInputChange({
                target: {
                    name: 'monto_total',
                    value: total
                }
            });
        } else {
            // Si no hay descuento, el monto total es igual al original
            onInputChange({
                target: {
                    name: 'monto_total',
                    value: value
                }
            });
        }
    };

    return (
        <div className="paso-detalles">
            {tipoHospedajeSeleccionado === '4' ? (
                // Interfaz para grupos
                <>
                    <div className="form-group">
                        <label htmlFor="cantidad_personas">
                            <FaUsers /> Cantidad de Personas del Grupo
                        </label>
                        <input
                            type="number"
                            id="cantidad_personas"
                            name="cantidad_personas"
                            value={formData.cantidad_personas}
                            onChange={handleCantidadPersonasChange}
                            min="1"
                            required
                            className="form-input"
                            placeholder="Ingrese la cantidad de personas"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="monto_total">
                            <FaMoneyBillWave /> Monto Total del Grupo
                        </label>
                        <input
                            type="number"
                            id="monto_total"
                            name="monto_total"
                            value={montoOriginalGrupo || formData.monto_total}
                            onChange={handleMontoTotalGrupoChange}
                            min="0"
                            step="0.01"
                            required
                            className="form-input"
                            placeholder="Ingrese el monto total"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="metodo_pago">
                            <FaCreditCard /> Método de Pago
                        </label>
                        <select
                            id="metodo_pago"
                            name="metodo_pago"
                            value={formData.metodo_pago}
                            onChange={handleMetodoPagoChange}
                            required
                            className="form-select"
                        >
                            <option value="">Seleccione un método de pago</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="descuento">
                            <FaPercent /> Seña (opcional)
                        </label>
                        <input
                            type="number"
                            id="descuento"
                            name="descuento"
                            value={descuento}
                            onChange={handleDescuentoChange}
                            min="0"
                            step="1"
                            className="form-input"
                            placeholder="Ingrese la seña a aplicar"
                        />
                    </div>

                    <div className="info-grupo">
                        <h3>Información del Grupo</h3>
                        <div className="info-item">
                            <span>Cantidad de días:</span>
                            <span>{desglosePrecio.cantidadDias}</span>
                        </div>
                        <div className="info-item">
                            <span>Tipo de reserva:</span>
                            <span>Grupo especial</span>
                        </div>
                        <div className="info-item">
                            <span>Precio por día:</span>
                            <span>${montoOriginalGrupo && desglosePrecio.cantidadDias ? (montoOriginalGrupo / desglosePrecio.cantidadDias).toFixed(2) : '0.00'}</span>
                        </div>
                        {montoOriginalGrupo > 0 && (
                            <div className="desglose-precio">
                                <h4>Desglose del Precio</h4>
                                <div className="desglose-item">
                                    <span>Monto original:</span>
                                    <span>${montoOriginalGrupo.toLocaleString()}</span>
                                </div>
                                {descuento > 0 && (
                                    <div className="desglose-item">
                                        <span>Seña:</span>
                                        <span>-${parseFloat(descuento).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="desglose-item total">
                                    <span>Total final:</span>
                                    <span>${formData.monto_total ? parseFloat(formData.monto_total).toLocaleString() : montoOriginalGrupo.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                        <p className="info-text">
                            <strong>Nota:</strong> Esta reserva no afecta la disponibilidad de cabañas, dormis o camping. 
                            Es una reserva especial para grupos grandes.
                        </p>
                    </div>
                </>
            ) : tipoHospedajeSeleccionado === '3' ? (
                // Interfaz para camping
                <>
                    <div className="form-group">
                        <label htmlFor="cantidad_adultos">
                            <FaUser /> Cantidad de Adultos
                        </label>
                        <input
                            type="number"
                            id="cantidad_adultos"
                            name="cantidad_adultos"
                            value={cantidadAdultos}
                            onChange={handleCantidadAdultosChange}
                            min="0"
                            required
                            className="form-input"
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cantidad_menores">
                            <FaChild /> Cantidad de Menores
                        </label>
                        <input
                            type="number"
                            id="cantidad_menores"
                            name="cantidad_menores"
                            value={cantidadMenores}
                            onChange={handleCantidadMenoresChange}
                            min="0"
                            required
                            className="form-input"
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="metodo_pago">
                            <FaCreditCard /> Método de Pago
                        </label>
                        <select
                            id="metodo_pago"
                            name="metodo_pago"
                            value={formData.metodo_pago}
                            onChange={handleMetodoPagoChange}
                            required
                            className="form-select"
                        >
                            <option value="">Seleccione un método de pago</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="descuento">
                            <FaPercent /> Seña (opcional)
                        </label>
                        <input
                            type="number"
                            id="descuento"
                            name="descuento"
                            value={descuento}
                            onChange={handleDescuentoChange}
                            min="0"
                            step="1"
                            className="form-input"
                            placeholder="Ingrese la seña a aplicar"
                        />
                    </div>

                    <div className="desglose-precio">
                        <h3>Desglose del Precio</h3>
                        <p className="info-text">
                            💡 El precio se calcula automáticamente según la cantidad de adultos y menores ingresados.
                        </p>
                        <div className="desglose-item">
                            <span>Precio Base por día:</span>
                            <span>${desglosePrecio.precioBase.toLocaleString()}</span>
                        </div>
                        {cantidadAdultos !== '' && parseInt(cantidadAdultos) > 0 && (
                            <div className="desglose-item">
                                <span>Precio por {cantidadAdultos} adulto(s):</span>
                                <span>${desglosePrecio.precioAdultos.toLocaleString()}</span>
                            </div>
                        )}
                        {cantidadMenores !== '' && parseInt(cantidadMenores) > 0 && (
                            <div className="desglose-item">
                                <span>Precio por {cantidadMenores} menor(es):</span>
                                <span>${desglosePrecio.precioMenores.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="desglose-item">
                            <span>Precio total por día:</span>
                            <span>${desglosePrecio.precioPorDia.toLocaleString()}</span>
                        </div>
                        <div className="desglose-item">
                            <span>Cantidad de días:</span>
                            <span>{desglosePrecio.cantidadDias}</span>
                        </div>
                        <div className="desglose-item">
                            <span>Subtotal:</span>
                            <span>${desglosePrecio.subtotal ? desglosePrecio.subtotal.toLocaleString() : '0.00'}</span>
                        </div>
                        <div className="desglose-item">
                            <span>Seña:</span>
                            <span>-${desglosePrecio.descuento ? desglosePrecio.descuento.toLocaleString() : '0.00'}</span>
                        </div>

                        <div className="desglose-item total">
                            <span>Total final:</span>
                            <span>${desglosePrecio.total ? desglosePrecio.total.toLocaleString() : '0.00'}</span>
                        </div>
                    </div>
                </>
            ) : (
                // Interfaz para cabañas y dormis
                <>
                    <div className="form-group">
                        <label htmlFor="cantidad_personas">
                            <FaUsers /> Cantidad de Personas
                        </label>
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
                        <label htmlFor="metodo_pago">
                            <FaCreditCard /> Método de Pago
                        </label>
                        <select
                            id="metodo_pago"
                            name="metodo_pago"
                            value={formData.metodo_pago}
                            onChange={handleMetodoPagoChange}
                            required
                            className="form-select"
                        >
                            <option value="">Seleccione un método de pago</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="descuento">
                            <FaPercent /> Seña (opcional)
                        </label>
                        <input
                            type="number"
                            id="descuento"
                            name="descuento"
                            value={descuento}
                            onChange={handleDescuentoChange}
                            min="0"
                            step="1"
                            className="form-input"
                            placeholder="Ingrese la seña a aplicar"
                        />
                    </div>

                    {formData.cantidad_personas && formData.fecha_entrada && formData.fecha_salida && (
                        <div className="desglose-precio">
                            <h3>Desglose del Precio</h3>
                            <div className="desglose-item">
                                <span>Precio por día ({formData.metodo_pago || 'efectivo'}):</span>
                                <span>${desglosePrecio.subtotal && desglosePrecio.cantidadDias ? (desglosePrecio.subtotal / desglosePrecio.cantidadDias).toLocaleString() : '0.00'}</span>
                            </div>
                            <div className="desglose-item">
                                <span>Cantidad de días:</span>
                                <span>{desglosePrecio.cantidadDias}</span>
                            </div>
                            <div className="desglose-item">
                                <span>Subtotal:</span>
                                <span>${desglosePrecio.subtotal ? desglosePrecio.subtotal.toLocaleString() : '0.00'}</span>
                            </div>
                            <div className="desglose-item">
                                <span>Seña:</span>
                                <span>-${desglosePrecio.descuento ? desglosePrecio.descuento.toLocaleString() : '0.00'}</span>
                            </div>
                            <div className="desglose-item total">
                                <span>Total final:</span>
                                <span>${desglosePrecio.total ? desglosePrecio.total.toLocaleString() : '0.00'}</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Campos comunes para todos los tipos de hospedaje */}
            {/* Método de pago y descuento ya están incluidos en cada tipo específico */}

            {/* El monto total ya se muestra en el desglose, no es necesario duplicarlo */}

            <div className="form-group">
                <label htmlFor="observaciones">
                    <FaComment /> Observaciones
                </label>
                <textarea
                    id="observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={onInputChange}
                    rows="4"
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
                    disabled={
                        !formData.metodo_pago ||
                        (tipoHospedajeSeleccionado === '4' && (formData.monto_total <= 0 || formData.cantidad_personas <= 0)) ||
                        (tipoHospedajeSeleccionado === '3' && (cantidadAdultos === '' || cantidadMenores === '')) ||
                        (tipoHospedajeSeleccionado !== '3' && tipoHospedajeSeleccionado !== '4' && !formData.cantidad_personas) ||
                        formData.monto_total <= 0
                    }
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};

export default PasoDetalles; 