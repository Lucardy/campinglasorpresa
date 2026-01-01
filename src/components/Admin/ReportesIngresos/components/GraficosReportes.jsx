import React, { memo, useMemo } from 'react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { formatearPrecio } from '../utils';

const COLORS = ['#667eea', '#28a745', '#fd7e14', '#20c997', '#e83e8c', '#007bff'];

const GraficosReportes = memo(({ estadisticas, estadisticasPorReserva }) => {
    const datosMetodoPago = useMemo(() => {
        if (!estadisticas.porMetodoPago) return [];
        return Object.entries(estadisticas.porMetodoPago).map(([metodo, datos]) => ({
            name: metodo.charAt(0).toUpperCase() + metodo.slice(1),
            value: datos.total,
            cantidad: datos.cantidad
        }));
    }, [estadisticas.porMetodoPago]);

    const datosTipoHospedaje = useMemo(() => {
        if (!estadisticas.porTipoHospedaje) return [];
        return Object.entries(estadisticas.porTipoHospedaje).map(([tipo, datos]) => ({
            name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            value: datos.total,
            cantidad: datos.cantidad
        }));
    }, [estadisticas.porTipoHospedaje]);

    const datosReservaPorTipo = useMemo(() => {
        if (!estadisticasPorReserva.porTipoHospedaje) return [];
        return Object.entries(estadisticasPorReserva.porTipoHospedaje).map(([tipo, datos]) => ({
            name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            total: datos.total,
            pagado: datos.pagado,
            pendiente: datos.pendiente
        }));
    }, [estadisticasPorReserva.porTipoHospedaje]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{payload[0].name}</p>
                    <p className="tooltip-value">
                        {formatearPrecio(payload[0].value)}
                        {payload[0].payload.cantidad && (
                            <span> ({payload[0].payload.cantidad} {payload[0].payload.cantidad === 1 ? 'pago' : 'pagos'})</span>
                        )}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (datosMetodoPago.length === 0 && datosTipoHospedaje.length === 0) {
        return null;
    }

    return (
        <div className="graficos-section">
            <h3>Visualización de Datos</h3>
            <div className="graficos-grid">
                {datosMetodoPago.length > 0 && (
                    <div className="grafico-container">
                        <h4>Ingresos por Método de Pago</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={datosMetodoPago}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {datosMetodoPago.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {datosTipoHospedaje.length > 0 && (
                    <div className="grafico-container">
                        <h4>Ingresos por Tipo de Hospedaje</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datosTipoHospedaje}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => formatearPrecio(value)} />
                                <Tooltip formatter={(value) => formatearPrecio(value)} />
                                <Legend />
                                <Bar dataKey="value" fill="#667eea" name="Ingresos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {datosReservaPorTipo.length > 0 && (
                    <div className="grafico-container grafico-completo">
                        <h4>Reservas por Tipo: Total, Pagado y Pendiente</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datosReservaPorTipo}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => formatearPrecio(value)} />
                                <Tooltip formatter={(value) => formatearPrecio(value)} />
                                <Legend />
                                <Bar dataKey="total" fill="#667eea" name="Total" />
                                <Bar dataKey="pagado" fill="#28a745" name="Pagado" />
                                <Bar dataKey="pendiente" fill="#fd7e14" name="Pendiente" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
});

GraficosReportes.displayName = 'GraficosReportes';

export default GraficosReportes;

