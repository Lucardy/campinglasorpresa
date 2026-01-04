import React from 'react';

const DatosReserva = ({ 
    formData,
    tiposHospedaje,
    hospedajesDisponibles,
    cantidadesDisponibles,
    verificandoDisponibilidad,
    calculandoPrecio,
    subtotal,
    cantidadAdultos,
    cantidadMenores,
    cantidadNoches,
    handleInputChange,
    getTipoHospedajeNombre,
    formatearNumeroHospedaje,
    handleCantidadAdultosChange,
    handleCantidadMenoresChange
}) => {
    return (
        <div className="form-section">
            <h3>🏕️ Datos de la Reserva</h3>
            {/* Primera fila: Fechas */}
            <div className="form-row">
                <div className="form-group">
                    <label>Fecha Entrada *</label>
                    <input
                        type="date"
                        name="fecha_entrada"
                        value={formData.fecha_entrada}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Fecha Salida *</label>
                    <input
                        type="date"
                        name="fecha_salida"
                        value={formData.fecha_salida}
                        onChange={handleInputChange}
                        min={formData.fecha_entrada || ''}
                        required
                    />
                    {cantidadNoches !== null && cantidadNoches > 0 && (
                        <div className="noches-info">
                            🌙 {cantidadNoches} {cantidadNoches === 1 ? 'noche' : 'noches'}
                        </div>
                    )}
                </div>
                <div className="form-group">
                    {/* Campo vacío para mantener el layout de 3 columnas */}
                </div>
            </div>

            {/* Segunda fila: Tipo y Número de Hospedaje */}
            <div className="form-row">
                <div className="form-group">
                    <label>Tipo Hospedaje *</label>
                    <select
                        name="tipo_hospedaje"
                        value={formData.tipo_hospedaje}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Seleccionar tipo</option>
                        {tiposHospedaje
                            .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                            .map(tipo => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </option>
                            ))}
                    </select>
                </div>
                {formData.tipo_hospedaje !== '3' && formData.tipo_hospedaje !== '4' && (
                    <div className="form-group">
                        <label>Número Hospedaje *</label>
                        <select
                            name="numero_hospedaje"
                            value={formData.numero_hospedaje}
                            onChange={handleInputChange}
                            required
                            disabled={!formData.tipo_hospedaje || verificandoDisponibilidad}
                        >
                            <option value="">
                                {verificandoDisponibilidad 
                                    ? '⏳ Verificando disponibilidad...' 
                                    : 'Seleccionar número'
                                }
                            </option>
                            {hospedajesDisponibles.map(hospedaje => (
                                <option key={hospedaje.id} value={hospedaje.id}>
                                    {formatearNumeroHospedaje(hospedaje)}
                                </option>
                            ))}
                        </select>
                        {verificandoDisponibilidad && (
                            <div className="verificando-disponibilidad">
                                🔍 Verificando disponibilidad para las fechas seleccionadas...
                            </div>
                        )}
                        {!verificandoDisponibilidad && formData.tipo_hospedaje && hospedajesDisponibles.length === 0 && (
                            <div className="sin-disponibilidad">
                                ⚠️ No hay hospedajes disponibles para las fechas seleccionadas
                            </div>
                        )}
                    </div>
                )}
                {formData.tipo_hospedaje === '3' && (
                    <div className="form-group">
                        <label>Camping</label>
                        <input
                            type="text"
                            value="Ilimitado"
                            readOnly
                            className="readonly-field"
                        />
                        <div className="cantidades-info">
                            🏕️ El camping tiene capacidad ilimitada
                        </div>
                    </div>
                )}
                {formData.tipo_hospedaje === '4' && (
                    <div className="form-group">
                        <label>Grupos</label>
                        <input
                            type="text"
                            value="Sin número específico"
                            readOnly
                            className="readonly-field"
                        />
                        <div className="cantidades-info">
                            👥 Los grupos no requieren número de hospedaje específico
                        </div>
                    </div>
                )}
                <div className="form-group">
                    {/* Campo vacío para mantener el layout de 3 columnas */}
                </div>
            </div>

            {/* Tercera fila: Cantidad de Personas y Método de Pago */}
            <div className="form-row">
                {formData.tipo_hospedaje === '3' ? (
                    // Campos específicos para camping
                    <>
                        <div className="form-group">
                            <label>Cantidad de Adultos *</label>
                            <input
                                type="number"
                                name="cantidad_adultos"
                                value={cantidadAdultos}
                                onChange={handleCantidadAdultosChange}
                                min="0"
                                required
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Cantidad de Menores *</label>
                            <input
                                type="number"
                                name="cantidad_menores"
                                value={cantidadMenores}
                                onChange={handleCantidadMenoresChange}
                                min="0"
                                required
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Total de Personas</label>
                            <input
                                type="number"
                                value={formData.cantidad_personas}
                                readOnly
                                className="readonly-field"
                            />
                        </div>
                    </>
                ) : formData.tipo_hospedaje === '4' ? (
                    // Campo libre para grupos
                    <>
                        <div className="form-group">
                            <label>Cantidad de Personas *</label>
                            <input
                                type="number"
                                name="cantidad_personas"
                                value={formData.cantidad_personas}
                                onChange={handleInputChange}
                                min="1"
                                required
                                placeholder="Ingresa la cantidad"
                            />
                            <div className="cantidades-info">
                                👥 Ingresa la cantidad de personas del grupo
                            </div>
                        </div>
                        <div className="form-group">
                            {/* Campo vacío para mantener el layout */}
                        </div>
                        <div className="form-group">
                            {/* Campo vacío para mantener el layout */}
                        </div>
                    </>
                ) : (
                    // Campo normal para otros tipos de hospedaje (cabañas, dormis)
                    <>
                        <div className="form-group">
                            <label>Personas *</label>
                            <select
                                name="cantidad_personas"
                                value={formData.cantidad_personas}
                                onChange={handleInputChange}
                                required
                                disabled={!formData.tipo_hospedaje}
                            >
                                <option value="">
                                    {formData.tipo_hospedaje 
                                        ? 'Seleccionar cantidad' 
                                        : 'Primero selecciona el tipo y número de hospedaje'
                                    }
                                </option>
                                {cantidadesDisponibles.map(cantidad => (
                                    <option key={cantidad} value={cantidad}>
                                        {cantidad} {cantidad === 1 ? 'persona' : 'personas'}
                                    </option>
                                ))}
                            </select>
                            {formData.tipo_hospedaje && cantidadesDisponibles.length > 0 && (
                                <div className="cantidades-info">
                                    💡 Cantidades disponibles para {getTipoHospedajeNombre(formData.tipo_hospedaje)}: {cantidadesDisponibles.join(', ')}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            {/* Campo vacío para mantener el layout */}
                        </div>
                        <div className="form-group">
                            {/* Campo vacío para mantener el layout */}
                        </div>
                    </>
                )}
            </div>

            {/* Cuarta fila: Método de Pago */}
            <div className="form-row">
                <div className="form-group">
                    <label>Método de Pago *</label>
                    <select
                        name="metodo_pago"
                        value={formData.metodo_pago}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="efectivo">💵 Efectivo</option>
                        <option value="transferencia">🏦 Transferencia</option>
                    </select>
                </div>
                <div className="form-group">
                    {/* Campo vacío para mantener el layout de 3 columnas */}
                </div>
                <div className="form-group">
                    {/* Campo vacío para mantener el layout de 3 columnas */}
                </div>
            </div>

            {/* Cuarta fila: Descuento */}
            <div className="form-row">
                <div className="form-group">
                    <label>Descuento (opcional)</label>
                    <select
                        name="tipo_descuento"
                        value={formData.tipo_descuento}
                        onChange={handleInputChange}
                    >
                        <option value="">Sin descuento</option>
                        <option value="porcentaje">Porcentaje (%)</option>
                        <option value="monto">Monto fijo ($)</option>
                    </select>
                    <div className="descuento-info">
                        🎯 Selecciona el tipo de descuento a aplicar
                    </div>
                </div>
                {formData.tipo_descuento && (
                    <div className="form-group">
                        <label>
                            {formData.tipo_descuento === 'porcentaje' ? 'Porcentaje (%)' : 'Monto ($)'}
                        </label>
                        <input
                            type="number"
                            name="valor_descuento"
                            value={formData.valor_descuento}
                            onChange={handleInputChange}
                            min="0"
                            step={formData.tipo_descuento === 'porcentaje' ? "0.01" : "1"}
                            placeholder={formData.tipo_descuento === 'porcentaje' ? "0.00" : "0"}
                        />
                        <div className="descuento-info">
                            {formData.tipo_descuento === 'porcentaje' 
                                ? '💡 Ingresa el porcentaje de descuento (ej: 10 para 10%)'
                                : '💡 Ingresa el monto fijo de descuento'
                            }
                        </div>
                    </div>
                )}
                {!formData.tipo_descuento && (
                    <div className="form-group">
                        {/* Campo vacío para mantener el layout */}
                    </div>
                )}
                <div className="form-group">
                    {/* Campo vacío para mantener el layout de 3 columnas */}
                </div>
            </div>

            {/* Quinta fila: Seña y Monto Total */}
            <div className="form-row">
                <div className="form-group">
                    <label>Seña (opcional)</label>
                    <input
                        type="number"
                        name="descuento"
                        value={formData.descuento}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        placeholder="0"
                    />
                    <div className="descuento-info">
                        💸 Ingresa el monto de la seña a aplicar
                    </div>
                </div>
                <div className="form-group">
                    <label>Monto Total *</label>
                    <input
                        type="number"
                        name="monto_total"
                        value={formData.monto_total}
                        onChange={handleInputChange}
                        placeholder={formData.tipo_hospedaje === '4' ? "Ingresa el monto" : (calculandoPrecio ? "Calculando..." : "0.00")}
                        step="0.01"
                        required
                        readOnly={formData.tipo_hospedaje !== '4' && calculandoPrecio}
                        className={formData.tipo_hospedaje !== '4' && calculandoPrecio ? "calculando-precio" : ""}
                    />
                    {formData.tipo_hospedaje === '4' ? (
                        <div className="cantidades-info">
                            💰 Ingresa manualmente el monto a cobrar para este grupo
                        </div>
                    ) : (
                        <>
                            {calculandoPrecio && (
                                <div className="calculando-precio-mensaje">
                                    💰 Calculando precio automáticamente...
                                </div>
                            )}
                            {!calculandoPrecio && formData.monto_total && (
                                <div className="precio-calculado">
                                    ✅ Precio calculado automáticamente ({formData.metodo_pago})
                                    {formData.tipo_descuento && formData.valor_descuento && (
                                        <div className="desglose-precio">
                                            <small>
                                                {formData.tipo_descuento === 'porcentaje' 
                                                    ? `Descuento: ${formData.valor_descuento}%`
                                                    : `Descuento: $${formData.valor_descuento}`
                                                }
                                            </small>
                                        </div>
                                    )}
                                    {formData.descuento > 0 && (
                                        <div className="desglose-precio">
                                            <small>Total: ${formData.monto_total} (Seña: ${formData.descuento}, Falta pagar: ${formData.monto_total - (parseFloat(formData.descuento) || 0)})</small>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="form-group">
                    {/* Campo vacío para mantener el layout de 3 columnas */}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        placeholder="Observaciones adicionales..."
                        rows="3"
                    />
                </div>
            </div>
        </div>
    );
};

export default DatosReserva;
