import React, { memo, useMemo, useState } from 'react';
import { formatearFecha, formatearPrecio, getIconoTipoHospedaje, getIconoMetodoPago } from '../utils';

const TablaPagos = memo(({ reportes }) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 20;

    const datosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        return reportes.slice(inicio, fin);
    }, [reportes, paginaActual]);

    const totalPaginas = useMemo(() => {
        return Math.ceil(reportes.length / itemsPorPagina);
    }, [reportes.length]);

    const handlePaginaAnterior = () => {
        setPaginaActual(prev => Math.max(1, prev - 1));
    };

    const handlePaginaSiguiente = () => {
        setPaginaActual(prev => Math.min(totalPaginas, prev + 1));
    };
    if (reportes.length === 0) {
        return (
            <div className="no-reportes">
                <p>No hay pagos disponibles para los filtros seleccionados</p>
            </div>
        );
    }

    return (
        <div className="reportes-tabla-section">
            <div className="tabla-header">
                <h3>Detalle de Pagos Recibidos</h3>
                <div className="tabla-info">
                    Mostrando {datosPaginados.length} de {reportes.length} pagos
                </div>
            </div>
            <div className="tabla-container">
                <table className="reportes-tabla">
                    <thead>
                        <tr>
                            <th>Fecha Pago</th>
                            <th>Cliente</th>
                            <th>Tipo Hospedaje</th>
                            <th>Método Pago</th>
                            <th>Monto</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPaginados.map((reporte, index) => {
                            const indiceGlobal = (paginaActual - 1) * itemsPorPagina + index;
                            return (
                                <tr key={reporte.pago_id || indiceGlobal}>
                                    <td>{formatearFecha(reporte.fecha_pago)}</td>
                                    <td>{reporte.nombre_cliente}</td>
                                    <td>
                                        <span className="tipo-hospedaje">
                                            {getIconoTipoHospedaje(reporte.tipo_hospedaje)} {reporte.tipo_hospedaje}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="metodo-pago">
                                            {getIconoMetodoPago(reporte.metodo_pago)} {reporte.metodo_pago}
                                        </span>
                                    </td>
                                    <td className="monto">{formatearPrecio(reporte.monto)}</td>
                                    <td>{reporte.pago_observaciones || '-'}</td>
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

TablaPagos.displayName = 'TablaPagos';

export default TablaPagos;

