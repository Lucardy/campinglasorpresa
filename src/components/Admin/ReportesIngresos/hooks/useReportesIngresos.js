import { useState, useEffect, useMemo, useCallback } from 'react';
import { notify } from '../../Notifications/NotificationSystem';
import config from '../../../../config';
import { calcularTotalProporcional } from '../utils';
import { debounce } from '../utils/debounce';

const useReportesIngresos = () => {
    const [reportes, setReportes] = useState([]); // Pagos reales (por fecha de pago)
    const [reportesPorReserva, setReportesPorReserva] = useState([]); // Reservas (por período de reserva)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: '',
        metodoPago: 'todos',
        tipoHospedaje: 'todos'
    });
    const [mesSeleccionado, setMesSeleccionado] = useState('');
    const [estadisticas, setEstadisticas] = useState({
        totalIngresos: 0,
        totalReservas: 0,
        promedioPorReserva: 0,
        porMetodoPago: {},
        porTipoHospedaje: {},
        totalProporcional: 0
    });
    const [estadisticasPorReserva, setEstadisticasPorReserva] = useState({
        totalIngresos: 0,
        totalPagado: 0,
        totalPendiente: 0,
        totalReservas: 0,
        promedioPorReserva: 0,
        porMetodoPago: {},
        porTipoHospedaje: {}
    });

    const cargarReportes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
            if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin);
            if (filtros.metodoPago !== 'todos') params.append('metodo_pago', filtros.metodoPago);
            if (filtros.tipoHospedaje !== 'todos') params.append('tipo_hospedaje', filtros.tipoHospedaje);

            const response = await fetch(`${config.API_URL}/reservas.php?reportes_ingresos&${params.toString()}`);
            if (!response.ok) throw new Error('Error al cargar reportes');
            
            const data = await response.json();
            if (data.success) {
                // Datos de ingresos reales (por fecha de pago)
                const reportesSrv = data.reportes || [];
                setReportes(reportesSrv);

                // Asegurar que tenemos totalProporcional; si el backend no lo envía, lo calculamos aquí
                const estSrv = data.estadisticas || {};
                const tieneProporcional = typeof estSrv.totalProporcional === 'number';
                const estConProporcional = tieneProporcional
                    ? estSrv
                    : { ...estSrv, totalProporcional: calcularTotalProporcional(reportesSrv, filtros.fechaInicio, filtros.fechaFin) };

                setEstadisticas(estConProporcional);

                // Datos de ingresos por período de reserva
                const reportesPorReservaSrv = data.reportesPorReserva || [];
                setReportesPorReserva(reportesPorReservaSrv);
                setEstadisticasPorReserva(data.estadisticasPorReserva || {
                    totalIngresos: 0,
                    totalPagado: 0,
                    totalPendiente: 0,
                    totalReservas: 0,
                    promedioPorReserva: 0,
                    porMetodoPago: {},
                    porTipoHospedaje: {}
                });
            } else {
                throw new Error(data.error || 'Error al cargar reportes');
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al cargar los reportes de ingresos');
            notify.error(error.message || 'Error al cargar los reportes de ingresos');
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    // Debounce para cargar reportes (500ms de delay)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            cargarReportes();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filtros, cargarReportes]);

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
        // Si se cambian las fechas manualmente, limpiar el selector de mes
        if (campo === 'fechaInicio' || campo === 'fechaFin') {
            setMesSeleccionado('');
        }
    };

    const handleMesChange = (mesAnio) => {
        setMesSeleccionado(mesAnio);
        
        if (mesAnio) {
            // Formato esperado: "YYYY-MM" (ej: "2024-12")
            const [anio, mes] = mesAnio.split('-');
            
            // Primer día del mes
            const primerDia = `${anio}-${mes}-01`;
            
            // Último día del mes: new Date(año, mes, 0) donde mes es 1-12
            // devuelve el último día del mes anterior, que es el último día del mes que queremos
            // Ejemplo: new Date(2024, 12, 0) = 31 de diciembre 2024
            const mesNum = parseInt(mes);
            const ultimoDia = new Date(parseInt(anio), mesNum, 0);
            const ultimoDiaStr = `${anio}-${mes}-${String(ultimoDia.getDate()).padStart(2, '0')}`;
            
            setFiltros(prev => ({
                ...prev,
                fechaInicio: primerDia,
                fechaFin: ultimoDiaStr
            }));
        } else {
            // Si se limpia el mes, también limpiar las fechas
            setFiltros(prev => ({
                ...prev,
                fechaInicio: '',
                fechaFin: ''
            }));
        }
    };

    const limpiarFiltros = () => {
        setFiltros({
            fechaInicio: '',
            fechaFin: '',
            metodoPago: 'todos',
            tipoHospedaje: 'todos'
        });
        setMesSeleccionado('');
    };

    const exportarReporte = () => {
        // Función para exportar a CSV (implementación básica)
        const csvContent = [
            ['Fecha Pago', 'Cliente', 'Tipo Hospedaje', 'Método Pago', 'Monto', 'Observaciones'],
            ...reportes.map(r => [
                new Date(r.fecha_pago).toLocaleDateString('es-AR'),
                r.nombre_cliente,
                r.tipo_hospedaje,
                r.metodo_pago,
                new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(r.monto),
                r.pago_observaciones || ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ingresos_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        notify.success('Reporte exportado correctamente');
    };

    return {
        // Estados
        reportes,
        reportesPorReserva,
        loading,
        error,
        filtros,
        mesSeleccionado,
        estadisticas,
        estadisticasPorReserva,
        // Acciones
        handleFiltroChange,
        handleMesChange,
        limpiarFiltros,
        exportarReporte,
        reintentar: cargarReportes
    };
};

export default useReportesIngresos;

