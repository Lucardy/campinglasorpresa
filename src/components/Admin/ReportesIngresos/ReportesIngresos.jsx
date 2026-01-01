import React from 'react';
import { 
    FaChartLine, 
    FaCalendarAlt, 
    FaMoneyBillWave, 
    FaCreditCard
} from 'react-icons/fa';
import { useReportesIngresos } from './hooks';
import {
    FiltrosReportes,
    EstadisticaCard,
    DesgloseEstadisticas,
    TablaPagos,
    TablaReservas,
    SeccionReporte,
    SkeletonLoader,
    GraficosReportes
} from './components';
import { formatearPrecio } from './utils';
import './ReportesIngresos.css';

const ReportesIngresos = () => {
    const {
        reportes,
        reportesPorReserva,
        loading,
        error,
        filtros,
        mesSeleccionado,
        estadisticas,
        estadisticasPorReserva,
        handleFiltroChange,
        handleMesChange,
        limpiarFiltros,
        exportarReporte,
        reintentar
    } = useReportesIngresos();

    if (loading && reportes.length === 0) {
        return (
            <div className="reportes-ingresos">
                <SkeletonLoader tipo="cards" />
            </div>
        );
    }

    if (error && reportes.length === 0) {
        return (
            <div className="reportes-ingresos">
                <div className="error-container">
                    <h3>Error al cargar reportes</h3>
                    <p>{error}</p>
                    <button onClick={reintentar} className="btn-reintentar">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="reportes-ingresos">
            <div className="reportes-header">
                <h2><FaChartLine /> Reportes de Ingresos</h2>
                <p>Análisis financiero de reservas y pagos</p>
            </div>

            {/* Filtros */}
            <FiltrosReportes
                filtros={filtros}
                mesSeleccionado={mesSeleccionado}
                onFiltroChange={handleFiltroChange}
                onMesChange={handleMesChange}
                onLimpiar={limpiarFiltros}
                onExportar={exportarReporte}
            />

            {/* SECCIÓN 1: INGRESOS REALES (Cash Flow) */}
            <SeccionReporte
                titulo="Ingresos Reales (Cash Flow)"
                icono={<FaMoneyBillWave />}
                descripcion="Dinero que realmente ingresó en el período seleccionado, basado en la fecha de pago. Muestra los pagos efectivamente recibidos en ese período."
                variante="seccion-ingresos-reales"
            >
                {/* Estadísticas de Ingresos Reales */}
                <div className="estadisticas-section">
                    <h3><FaChartLine /> Resumen de Ingresos Reales</h3>
                    <div className="estadisticas-grid">
                        <EstadisticaCard
                            icono={<FaMoneyBillWave />}
                            titulo="Total Ingresos (cobrado)"
                            valor={formatearPrecio(estadisticas.totalIngresos)}
                        />
                        <EstadisticaCard
                            icono={<FaCalendarAlt />}
                            titulo="Total Reservas"
                            valor={estadisticas.totalReservas}
                        />
                        <EstadisticaCard
                            icono={<FaMoneyBillWave />}
                            titulo="Total Pagos"
                            valor={estadisticas.totalPagos || reportes.length}
                        />
                        <EstadisticaCard
                            icono={<FaChartLine />}
                            titulo="Promedio por Pago"
                            valor={formatearPrecio(estadisticas.promedioPorPago || (reportes.length > 0 ? estadisticas.totalIngresos / reportes.length : 0))}
                        />
                    </div>

                    {/* Desglose por método de pago */}
                    <DesgloseEstadisticas
                        tipo="metodoPago"
                        datos={estadisticas.porMetodoPago}
                    />

                    {/* Desglose por tipo de hospedaje */}
                    <DesgloseEstadisticas
                        tipo="tipoHospedaje"
                        datos={estadisticas.porTipoHospedaje}
                    />
                </div>

                {/* Gráficos */}
                <GraficosReportes 
                    estadisticas={estadisticas}
                    estadisticasPorReserva={estadisticasPorReserva}
                />

                {/* Tabla de Pagos Reales */}
                {loading ? <SkeletonLoader tipo="tabla" /> : <TablaPagos reportes={reportes} />}
            </SeccionReporte>

            {/* SECCIÓN 2: INGRESOS POR PERÍODO DE RESERVA */}
            <SeccionReporte
                titulo="Ingresos por Período de Reserva"
                icono={<FaCalendarAlt />}
                descripcion="Reservas que corresponden al período seleccionado, basado en las fechas de entrada y salida. Muestra el monto total de cada reserva, independientemente de cuándo se pagó."
                variante="seccion-ingresos-reserva"
            >
                {/* Estadísticas por Período de Reserva */}
                <div className="estadisticas-section">
                    <h3><FaChartLine /> Resumen por Período de Reserva</h3>
                    <div className="estadisticas-grid">
                        <EstadisticaCard
                            icono={<FaMoneyBillWave />}
                            titulo="Total Reservas (monto total)"
                            valor={formatearPrecio(estadisticasPorReserva.totalIngresos)}
                            variante="estadistica-total"
                        />
                        <EstadisticaCard
                            icono={<FaCreditCard />}
                            titulo="Total Pagado"
                            valor={formatearPrecio(estadisticasPorReserva.totalPagado)}
                            variante="estadistica-pagado"
                        />
                        <EstadisticaCard
                            icono={<FaCalendarAlt />}
                            titulo="Total Pendiente"
                            valor={formatearPrecio(estadisticasPorReserva.totalPendiente)}
                            variante="estadistica-pendiente"
                        />
                        <EstadisticaCard
                            icono={<FaChartLine />}
                            titulo="Total Reservas"
                            valor={estadisticasPorReserva.totalReservas}
                        />
                    </div>

                    {/* Desglose por método de pago */}
                    <DesgloseEstadisticas
                        tipo="metodoPago"
                        datos={estadisticasPorReserva.porMetodoPago}
                    />

                    {/* Desglose por tipo de hospedaje */}
                    <DesgloseEstadisticas
                        tipo="tipoHospedaje"
                        datos={estadisticasPorReserva.porTipoHospedaje}
                        mostrarDetalle={true}
                    />
                </div>

                {/* Tabla de Reservas por Período */}
                {loading ? <SkeletonLoader tipo="tabla" /> : <TablaReservas reportesPorReserva={reportesPorReserva} />}
            </SeccionReporte>
        </div>
    );
};

export default ReportesIngresos;
