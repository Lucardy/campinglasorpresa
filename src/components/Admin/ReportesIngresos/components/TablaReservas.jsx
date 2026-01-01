import React, { memo, useMemo, useState } from 'react';
import { formatearFecha, formatearPrecio, getIconoTipoHospedaje } from '../utils';

const TablaReservas = memo(({ reportesPorReserva }) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 20;

    const datosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        return reportesPorReserva.slice(inicio, fin);
    }, [reportesPorReserva, paginaActual]);

    const totalPaginas = useMemo(() => {
        return Math.ceil(reportesPorReserva.length / itemsPorPagina);
    }, [reportesPorReserva.length]);

    const handlePaginaAnterior = () => {
        setPaginaActual(prev => Math.max(1, prev - 1));
    };

    const handlePaginaSiguiente = () => {
        setPaginaActual(prev => Math.min(totalPaginas, prev + 1));
    };
    if (reportesPorReserva.length === 0) {
        return (
            <div className="no-reportes">
                <p>No hay reservas disponibles para los filtros seleccionados</p>
            </div>
        );
    }

    return (
        <div className="reportes-tabla-section">
            <div className="tabla-header">
                <h3>Detalle de Reservas del Período</h3>
                <div className="tabla-info">
                    Mostrando {datosPaginados.length} de {reportesPorReserva.length} reservas
                </div>
            </div>
            <div className="tabla-container">
                <table className="reportes-tabla">
                    <thead>
                        <tr>
                            <th>Fecha Entrada</th>
                            <th>Fecha Salida</th>
                            <th>Cliente</th>
                            <th>Tipo Hospedaje</th>
                            <th>Monto Total</th>
                            <th>Pagado</th>
                            <th>Pendiente</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPaginados.map((reserva, index) => {
                            const indiceGlobal = (paginaActual - 1) * itemsPorPagina + index;
                            const montoTotal = parseFloat(reserva.monto_total) || 0;
                            const pagado = parseFloat(reserva.total_pagado) || 0;
                            const pendiente = montoTotal - pagado;
                            return (
                                <tr key={reserva.reserva_id || indiceGlobal}>
                                    <td>{formatearFecha(reserva.fecha_entrada)}</td>
                                    <td>{formatearFecha(reserva.fecha_salida)}</td>
                                    <td>{reserva.nombre_cliente}</td>
                                    <td>
                                        <span className="tipo-hospedaje">
                                            {getIconoTipoHospedaje(reserva.tipo_hospedaje)} {reserva.tipo_hospedaje}
                                        </span>
                                    </td>
                                    <td className="monto">{formatearPrecio(montoTotal)}</td>
                                    <td className="monto-pagado">{formatearPrecio(pagado)}</td>
                                    <td className={`monto-pendiente ${pendiente > 0 ? 'tiene-pendiente' : ''}`}>
                                        {formatearPrecio(pendiente)}
                                    </td>
                                    <td>
                                        <span className={`estado estado-${reserva.estado?.toLowerCase() || 'activa'}`}>
                                            {reserva.estado || 'Activa'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {totalPaginas > 1 && (
                <div className="paginacion">
                    <button 
                        onClick={handlePaginaAnterior} 
                        disabled={paginaActual === 1}
                        className="btn-paginacion"
                    >
                        Anterior
                    </button>
                    <span className="pagina-info">
                        Página {paginaActual} de {totalPaginas}
                    </span>
                    <button 
                        onClick={handlePaginaSiguiente} 
                        disabled={paginaActual === totalPaginas}
                        className="btn-paginacion"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
});

TablaReservas.displayName = 'TablaReservas';

export default TablaReservas;

