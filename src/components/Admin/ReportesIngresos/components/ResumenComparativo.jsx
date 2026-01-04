import React from 'react';
import { FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { formatearPrecio } from '../utils';
import './ResumenComparativo.css';

const ResumenComparativo = ({ estadisticas, estadisticasPorReserva }) => {
    // Calcular diferencias y porcentajes
    const deberiaCobrar = estadisticasPorReserva.totalIngresos || 0;
    const cobradoReal = estadisticas.totalIngresos || 0;
    const cobradoEnPeriodo = estadisticasPorReserva.totalPagadoEnPeriodo || 0;
    
    // Usar el valor más preciso para comparar (cobradoEnPeriodo si está disponible, sino cobradoReal)
    const cobradoComparar = cobradoEnPeriodo > 0 ? cobradoEnPeriodo : cobradoReal;
    
    // La diferencia es lo que falta cobrar del período
    // Esto es: lo que se debería cobrar - lo que realmente se cobró en el período
    const diferencia = deberiaCobrar - cobradoComparar;
    const porcentajeCobrado = deberiaCobrar > 0 ? (cobradoComparar / deberiaCobrar) * 100 : 0;
    
    // Determinar el estado
    const estaCompleto = diferencia <= 0.01; // Tolerancia para errores de redondeo
    const tienePendiente = diferencia > 0.01; // Pendiente es la diferencia misma

    return (
        <div className="resumen-comparativo">
            <div className="resumen-header">
                <h2><FaChartLine /> Resumen del Período</h2>
                <p className="resumen-subtitulo">
                    Comparación entre lo que se debería cobrar y lo que realmente se cobró
                </p>
            </div>

            <div className="comparacion-principal">
                {/* Lo que se debería cobrar */}
                <div className="comparacion-card deberia-cobrar">
                    <div className="card-header">
                        <FaCalendarAlt className="card-icon" />
                        <h3>Se Debería Cobrar</h3>
                    </div>
                    <div className="card-content">
                        <div className="monto-principal">
                            {formatearPrecio(deberiaCobrar)}
                        </div>
                        <p className="card-descripcion">
                            Monto total de reservas que corresponden a este período
                        </p>
                        <div className="card-detalle">
                            <span className="detalle-label">Reservas:</span>
                            <span className="detalle-valor">{estadisticasPorReserva.totalReservas || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Separador visual */}
                <div className="comparacion-flecha">
                    <div className="flecha-linea"></div>
                    <div className="flecha-icono">
                        {estaCompleto ? (
                            <FaCheckCircle className="icono-completo" />
                        ) : (
                            <FaExclamationTriangle className="icono-pendiente" />
                        )}
                    </div>
                    <div className="flecha-linea"></div>
                </div>

                {/* Lo que realmente se cobró */}
                <div className="comparacion-card cobrado-real">
                    <div className="card-header">
                        <FaMoneyBillWave className="card-icon" />
                        <h3>Realmente se Cobró</h3>
                    </div>
                    <div className="card-content">
                        <div className="monto-principal">
                            {formatearPrecio(cobradoComparar)}
                        </div>
                        <p className="card-descripcion">
                            Dinero que ingresó en este período (Cash Flow)
                        </p>
                        <div className="card-detalle">
                            <span className="detalle-label">Pagos recibidos:</span>
                            <span className="detalle-valor">{estadisticas.totalPagos || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Indicadores de estado */}
            <div className="indicadores-estado">
                <div className={`indicador ${estaCompleto ? 'completo' : 'pendiente'}`}>
                    <div className="indicador-icono">
                        {estaCompleto ? (
                            <FaCheckCircle />
                        ) : (
                            <FaExclamationTriangle />
                        )}
                    </div>
                    <div className="indicador-contenido">
                        <div className="indicador-titulo">
                            {estaCompleto ? 'Cobro Completo' : 'Cobro Pendiente'}
                        </div>
                        <div className="indicador-valor">
                            {porcentajeCobrado.toFixed(1)}% cobrado
                        </div>
                    </div>
                </div>

                {tienePendiente && (
                    <div className="indicador pendiente-monto">
                        <div className="indicador-icono">
                            <FaExclamationTriangle />
                        </div>
                        <div className="indicador-contenido">
                            <div className="indicador-titulo">Pendiente por Cobrar</div>
                            <div className="indicador-valor destacado">
                                {formatearPrecio(diferencia)}
                            </div>
                            <div className="indicador-descripcion">
                                Lo que falta cobrar de este período
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumenComparativo;

