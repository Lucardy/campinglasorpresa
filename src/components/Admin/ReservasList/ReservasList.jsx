import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaTrash, FaEye } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './ReservasList.css';
import config from '../../../config';
import { notify } from '../Notifications/NotificationSystem';
import EditarReservaModal from './EditarReservaModal';
import ResumenPagos from './ResumenPagos';
import { formatDate, calcularNoches } from '../../../utils/dateUtils';
import reservaService from '../../../services/reservaService';

const ReservasList = ({ reservas: initialReservas, onDelete, onAddNew, onRefresh, onUpdate }) => {
    const [reservas, setReservas] = useState(initialReservas);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('fecha_entrada');
    const [sortDirection, setSortDirection] = useState('desc');
    const [tipoHospedajeFilter, setTipoHospedajeFilter] = useState('todos');
    const [filtroPagoPendiente, setFiltroPagoPendiente] = useState('todos'); // 'todos', 'pendientes', 'completas'
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [mesSeleccionado, setMesSeleccionado] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReserva, setEditingReserva] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [lastSearchTerm, setLastSearchTerm] = useState('');
    const [refreshPagosKey, setRefreshPagosKey] = useState(0);

    const itemsPerPage = config.ITEMS_PER_PAGE;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setReservas(initialReservas);
        setCurrentPage(1);
        // Actualizar la reserva seleccionada si existe y cambió
        if (selectedReserva) {
            const reservaActualizada = initialReservas.find(r => r.id === selectedReserva.id);
            if (reservaActualizada) {
                setSelectedReserva(reservaActualizada);
            }
        }
    }, [initialReservas]);



    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
        
        // Limpiar timeout anterior si existe
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        if (value.trim() === '') {
            setReservas(initialReservas);
            setIsSearching(false);
            setLastSearchTerm('');
            return;
        }

        // Crear nuevo timeout para debounce
        const timeout = setTimeout(async () => {
            // Solo mostrar notificación si el término de búsqueda es diferente al último
            const shouldShowNotification = value !== lastSearchTerm;
            setLastSearchTerm(value);
            
            setIsSearching(true);
            try {
                console.log('🔍 Buscando reservas con término:', value);
                const data = await reservaService.searchReservas(value);
                
                // Si no hay resultados de la API, intentar búsqueda local como fallback
                if (!data || data.length === 0) {
                    console.log('🔄 Usando búsqueda local como fallback...');
                    const searchTermLower = value.toLowerCase();
                    const filtered = initialReservas.filter(reserva => 
                        (reserva.nombre?.toLowerCase() || '').includes(searchTermLower) ||
                        (reserva.apellido?.toLowerCase() || '').includes(searchTermLower) ||
                        (reserva.tipo_hospedaje?.toLowerCase() || '').includes(searchTermLower) ||
                        (reserva.numero_hospedaje?.toString() || '').includes(searchTermLower) ||
                        (reserva.observaciones?.toLowerCase() || '').includes(searchTermLower)
                    );
                    setReservas(filtered);
                    if (filtered.length === 0 && shouldShowNotification) {
                        notify.info('No se encontraron reservas con ese criterio de búsqueda');
                    }
                    setIsSearching(false);
                    return;
                }
                console.log('🔍 Datos recibidos:', data);
                
                // Verificar si los datos de la API son problemáticos
                const apiIds = data.map(r => r.id);
                const initialIds = initialReservas.map(r => r.id);
                const reservasProblematicas = apiIds.filter(id => !initialIds.includes(id));
                
                if (reservasProblematicas.length > 0) {
                    console.warn('⚠️ API devolvió reservas problemáticas:', reservasProblematicas);
                    console.log('🔄 Usando búsqueda local para evitar datos fantasma...');
                    // Usar búsqueda local en lugar de datos de la API
                    const searchTermLower = value.toLowerCase();
                    const filtered = initialReservas.filter(reserva => 
                        (reserva.nombre?.toLowerCase() || '').includes(searchTermLower) ||
                        (reserva.apellido?.toLowerCase() || '').includes(searchTermLower) ||
                        (reserva.tipo_hospedaje?.toLowerCase() || '').includes(searchTermLower) ||
                        (reserva.numero_hospedaje?.toString() || '').includes(searchTermLower) ||
                        (reserva.observaciones?.toLowerCase() || '').includes(searchTermLower)
                    );
                    setReservas(filtered);
                    if (filtered.length === 0 && shouldShowNotification) {
                        notify.info('No se encontraron reservas con ese criterio de búsqueda');
                    }
                    return;
                }
                
                setReservas(data);
                if (data.length === 0 && shouldShowNotification) {
                    notify.info('No se encontraron reservas con ese criterio de búsqueda');
                }
            } catch (error) {
                console.error('🔍 Error al buscar reservas:', error);
                // Fallback a búsqueda local si hay error de red
                console.log('🔄 Usando búsqueda local como fallback...');
                const searchTermLower = value.toLowerCase();
                const filtered = initialReservas.filter(reserva => 
                    (reserva.nombre?.toLowerCase() || '').includes(searchTermLower) ||
                    (reserva.apellido?.toLowerCase() || '').includes(searchTermLower) ||
                    (reserva.tipo_hospedaje?.toLowerCase() || '').includes(searchTermLower) ||
                    (reserva.numero_hospedaje?.toString() || '').includes(searchTermLower) ||
                    (reserva.observaciones?.toLowerCase() || '').includes(searchTermLower)
                );
                setReservas(filtered);
                if (filtered.length === 0 && shouldShowNotification) {
                    notify.info('No se encontraron reservas con ese criterio de búsqueda');
                }
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms de delay
        
        setSearchTimeout(timeout);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar esta reserva?')) {
            return;
        }

        try {
            await onDelete(id);
            notify.success('Reserva eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar reserva:', error);
            notify.error(error.message || 'Error al eliminar la reserva');
        }
    };

    const handleEdit = (reserva) => {
        setEditingReserva(reserva);
        setIsEditModalOpen(true);
    };

    const handleReservaUpdated = async (reservaId, reservaData) => {
        // Actualizar estado global
        if (onUpdate) {
            await onUpdate(reservaId, reservaData);
        }
        // Refrescar la lista de reservas para ver los cambios inmediatamente
        if (onRefresh) {
            await onRefresh();
        }
        // Forzar actualización de ResumenPagos
        setRefreshPagosKey(prev => prev + 1);
    };

    const handleViewReserva = (reserva) => {
        setSelectedReserva(reserva);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReserva(null);
    };

    const handleSort = (field) => {
        const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);

        const sortedReservas = [...reservas].sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            if (field === 'fecha_entrada' || field === 'fecha_salida') {
                valueA = new Date(valueA).getTime();
                valueB = new Date(valueB).getTime();
            }

            if (direction === 'asc') {
                return valueA > valueB ? 1 : -1;
            }
            return valueA < valueB ? 1 : -1;
        });

        setReservas(sortedReservas);
        notify.info(`Lista ordenada por ${field} ${direction === 'asc' ? 'ascendente' : 'descendente'}`);
    };

    const handleFilter = (tipo) => {
        setTipoHospedajeFilter(tipo);
        notify.info(`Filtrando por tipo de hospedaje: ${tipo === 'todos' ? 'Todos' : tipo}`);
    };

    const handleFiltroPagoPendiente = (filtro) => {
        setFiltroPagoPendiente(filtro);
        const mensajes = {
            'todos': 'Mostrando todas las reservas',
            'pendientes': 'Mostrando solo reservas con pagos pendientes',
            'completas': 'Mostrando solo reservas completamente pagadas'
        };
        notify.info(mensajes[filtro]);
    };

    const handleFechaInicioChange = (fecha) => {
        setFechaInicio(fecha);
        setMesSeleccionado(''); // Limpiar mes si se cambia fecha manualmente
    };

    const handleFechaFinChange = (fecha) => {
        setFechaFin(fecha);
        setMesSeleccionado(''); // Limpiar mes si se cambia fecha manualmente
    };

    const handleMesChange = (mesAnio) => {
        setMesSeleccionado(mesAnio);
        
        if (mesAnio) {
            // Formato esperado: "YYYY-MM" (ej: "2024-12")
            const [anio, mes] = mesAnio.split('-');
            
            // Primer día del mes
            const primerDia = `${anio}-${mes}-01`;
            
            // Último día del mes
            const mesNum = parseInt(mes);
            const ultimoDia = new Date(parseInt(anio), mesNum, 0);
            const ultimoDiaStr = `${anio}-${mes}-${String(ultimoDia.getDate()).padStart(2, '0')}`;
            
            setFechaInicio(primerDia);
            setFechaFin(ultimoDiaStr);
        } else {
            // Si se limpia el mes, también limpiar las fechas
            setFechaInicio('');
            setFechaFin('');
        }
    };

    const limpiarFiltrosFecha = () => {
        setFechaInicio('');
        setFechaFin('');
        setMesSeleccionado('');
    };

    // Función helper para determinar si una reserva tiene pagos pendientes
    const tienePagosPendientes = (reserva) => {
        const estadoPago = reserva.estado_pago || 'pendiente';
        const totalPagado = parseFloat(reserva.total_pagado || 0);
        const montoTotalNum = parseFloat(reserva.monto_total || 0);
        const descuentoValue = parseFloat(reserva.descuento || 0);
        
        // Calcular monto total real (misma lógica que getEstadoPago)
        let montoTotalReal = montoTotalNum;
        if (descuentoValue > 0) {
            const esReservaNueva = montoTotalNum >= descuentoValue;
            if (!esReservaNueva) {
                montoTotalReal = montoTotalNum + descuentoValue;
            }
        }
        
        const faltaPagar = montoTotalReal - totalPagado;
        return faltaPagar > 0.01; // Tolerancia para errores de redondeo
    };

    const filteredReservas = reservas.filter(reserva => {
        // Filtro por tipo de hospedaje
        const pasaFiltroTipo = tipoHospedajeFilter === 'todos' || reserva.tipo_hospedaje === tipoHospedajeFilter;
        
        // Filtro por estado de pago
        let pasaFiltroPago = true;
        if (filtroPagoPendiente === 'pendientes') {
            pasaFiltroPago = tienePagosPendientes(reserva);
        } else if (filtroPagoPendiente === 'completas') {
            pasaFiltroPago = !tienePagosPendientes(reserva);
        }
        
        // Filtro por fechas (basado en fecha_entrada de la reserva)
        let pasaFiltroFecha = true;
        if (fechaInicio || fechaFin) {
            const fechaEntrada = new Date(reserva.fecha_entrada);
            fechaEntrada.setHours(0, 0, 0, 0); // Normalizar a inicio del día
            
            if (fechaInicio && fechaFin) {
                // Rango de fechas: la reserva debe estar dentro del rango
                const inicio = new Date(fechaInicio);
                inicio.setHours(0, 0, 0, 0);
                const fin = new Date(fechaFin);
                fin.setHours(23, 59, 59, 999); // Incluir todo el día final
                pasaFiltroFecha = fechaEntrada >= inicio && fechaEntrada <= fin;
            } else if (fechaInicio) {
                // Solo fecha inicio: la reserva debe ser desde esa fecha en adelante
                const inicio = new Date(fechaInicio);
                inicio.setHours(0, 0, 0, 0);
                pasaFiltroFecha = fechaEntrada >= inicio;
            } else if (fechaFin) {
                // Solo fecha fin: la reserva debe ser hasta esa fecha
                const fin = new Date(fechaFin);
                fin.setHours(23, 59, 59, 999);
                pasaFiltroFecha = fechaEntrada <= fin;
            }
        }
        
        return pasaFiltroTipo && pasaFiltroPago && pasaFiltroFecha;
    });

    const totalPages = Math.ceil(filteredReservas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReservas = filteredReservas.slice(startIndex, startIndex + itemsPerPage);

    // Usar la función formatDate importada de dateUtils

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    const getClienteNombre = (reserva) => {
        return `${reserva.apellido}, ${reserva.nombre}`;
    };

    const getHospedajeNombre = (reserva) => {
        return `${reserva.tipo_hospedaje} ${reserva.numero_hospedaje}`;
    };

    // Función removida - ahora se permite editar todas las reservas
    // Las validaciones de disponibilidad están implementadas en el backend

    const getEstadoPago = (reserva) => {
        const estadoPago = reserva.estado_pago || 'pendiente';
        const totalPagado = parseFloat(reserva.total_pagado || 0);
        const montoTotalNum = parseFloat(reserva.monto_total || 0);
        const descuentoValue = parseFloat(reserva.descuento || 0);
        
        // Calcular monto total real (FIJO - no cambia con los pagos)
        // Diferencia entre reservas nuevas y antiguas:
        // - Reservas nuevas: monto_total ya es el total completo (sin descontar la seña), NO debemos sumar el descuento
        // - Reservas antiguas: monto_total tiene la seña descontada, entonces monto_total + descuento = total real
        // 
        // Detección: Si monto_total >= descuento, entonces es una reserva nueva donde monto_total ya es el total completo.
        let montoTotalReal = montoTotalNum;
        if (descuentoValue > 0) {
            // Detectar si es reserva nueva o antigua
            // Reserva nueva: monto_total >= descuento (monto_total ya es el total completo)
            // Reserva antigua: monto_total < descuento (monto_total tiene la seña descontada)
            const esReservaNueva = montoTotalNum >= descuentoValue;
            
            if (!esReservaNueva) {
                // Es una reserva antigua: monto_total tiene la seña descontada
                // Sumar el descuento para obtener el total real
                montoTotalReal = montoTotalNum + descuentoValue;
            }
            // Si es reserva nueva, montoTotalReal = montoTotalNum (ya correcto)
        }
        
        // NO actualizar montoTotalReal basado en totalPagado
        // El monto total es fijo y solo cambia si se edita la reserva
        
        const faltaPagar = montoTotalReal - totalPagado;

        switch (estadoPago) {
            case 'completo':
                return {
                    texto: formatCurrency(0),
                    icono: '✅',
                    clase: 'completo',
                    color: '#28a745',
                    faltaPagar: 0
                };
            case 'parcial':
                return {
                    texto: formatCurrency(faltaPagar),
                    icono: '⚠️',
                    clase: 'parcial',
                    color: '#fd7e14',
                    faltaPagar: faltaPagar
                };
            default:
                return {
                    texto: formatCurrency(faltaPagar),
                    icono: '⏳',
                    clase: 'pendiente',
                    color: '#ffc107',
                    faltaPagar: faltaPagar
                };
        }
    };
    
    const getMontoTotalReal = (reserva) => {
        const montoTotalNum = parseFloat(reserva.monto_total || 0);
        const descuentoValue = parseFloat(reserva.descuento || 0);
        
        // Calcular monto total real (FIJO - no cambia con los pagos)
        // Diferencia entre reservas nuevas y antiguas:
        // - Reservas nuevas: monto_total ya es el total completo (sin descontar la seña), NO debemos sumar el descuento
        // - Reservas antiguas: monto_total tiene la seña descontada, entonces monto_total + descuento = total real
        // 
        // Detección: Si monto_total >= descuento, entonces es una reserva nueva donde monto_total ya es el total completo.
        // Si monto_total < descuento, entonces es una reserva antigua donde monto_total tiene la seña descontada.
        let montoTotalReal = montoTotalNum;
        if (descuentoValue > 0) {
            // Detectar si es reserva nueva o antigua
            // Reserva nueva: monto_total >= descuento (monto_total ya es el total completo)
            // Reserva antigua: monto_total < descuento (monto_total tiene la seña descontada)
            const esReservaNueva = montoTotalNum >= descuentoValue;
            
            if (!esReservaNueva) {
                // Es una reserva antigua: monto_total tiene la seña descontada
                // Sumar el descuento para obtener el total real
                montoTotalReal = montoTotalNum + descuentoValue;
            }
            // Si es reserva nueva, montoTotalReal = montoTotalNum (ya correcto)
        }
        
        return montoTotalReal;
    };

    const renderMobileView = () => {
        const recentReservas = paginatedReservas.slice(0, 3);
        
        return (
            <div className="mobile-reservas">
                {recentReservas.map((reserva) => (
                    <div key={reserva.id} className="reserva-card">
                        <div className="reserva-header">
                            <h3>{getClienteNombre(reserva)}</h3>
                            <span className={`status-badge ${(reserva.estado || 'pendiente').toLowerCase()}`}>
                                {reserva.estado === 'pendiente' && '⏳'}
                                {reserva.estado === 'confirmada' && '✅'}
                                {reserva.estado === 'cancelada' && '❌'}
                                {reserva.estado || 'Pendiente'}
                            </span>
                        </div>
                        <div className="reserva-details">
                            <div className="detail-row">
                                <span className="label">Hospedaje:</span>
                                <span className="value">{getHospedajeNombre(reserva)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Entrada:</span>
                                <span className="value">{formatDate(reserva.fecha_entrada)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Salida:</span>
                                <span className="value">{formatDate(reserva.fecha_salida)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Noches:</span>
                                <span className="value">{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida)} noche{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida) !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Monto Total:</span>
                                <span className="value">{formatCurrency(getMontoTotalReal(reserva))}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Falta Abonar:</span>
                                <span className={`value estado-pago-${getEstadoPago(reserva).clase}`}>
                                    {getEstadoPago(reserva).icono} {getEstadoPago(reserva).texto}
                                </span>
                            </div>
                        </div>
                        <div className="reserva-actions">
                            <button 
                                className="btn-view"
                                onClick={() => handleViewReserva(reserva)}
                            >
                                <FaEye /> Ver
                            </button>
                            <button 
                                className="btn-edit"
                                onClick={() => handleEdit(reserva)}
                            >
                                <FaEdit /> Editar
                            </button>
                            <button 
                                className="btn-delete"
                                onClick={() => handleDelete(reserva.id)}
                            >
                                <FaTrash /> Eliminar
                            </button>
                        </div>
                    </div>
                ))}
                {paginatedReservas.length > 3 && (
                    <div className="view-more">
                        <p>Hay {paginatedReservas.length - 3} reservas más. Usa el buscador para encontrarlas.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderDesktopView = () => {
        return (
            <div className="table-container">
                <table className="reservas-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('apellido')} className="sortable">
                                Cliente {sortField === 'apellido' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('fecha_entrada')} className="sortable">
                                Entrada {sortField === 'fecha_entrada' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('fecha_salida')} className="sortable">
                                Salida {sortField === 'fecha_salida' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Noches</th>
                            <th onClick={() => handleSort('tipo_hospedaje')} className="sortable">
                                Hospedaje {sortField === 'tipo_hospedaje' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('monto_total')} className="sortable">
                                Monto Total {sortField === 'monto_total' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Estado</th>
                            <th>Falta Abonar</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedReservas.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-results">
                                    {isSearching ? 'Buscando...' : 'No se encontraron reservas'}
                                </td>
                            </tr>
                        ) : (
                            paginatedReservas.map((reserva) => (
                                <tr key={reserva.id}>
                                    <td>{getClienteNombre(reserva)}</td>
                                    <td>{formatDate(reserva.fecha_entrada)}</td>
                                    <td>{formatDate(reserva.fecha_salida)}</td>
                                    <td>{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida)} noche{calcularNoches(reserva.fecha_entrada, reserva.fecha_salida) !== 1 ? 's' : ''}</td>
                                    <td>{getHospedajeNombre(reserva)}</td>
                                    <td>{formatCurrency(getMontoTotalReal(reserva))}</td>
                                    <td>
                                        <span className={`status-badge ${(reserva.estado || 'pendiente').toLowerCase()}`}>
                                            {reserva.estado === 'pendiente' && '⏳'}
                                            {reserva.estado === 'confirmada' && '✅'}
                                            {reserva.estado === 'cancelada' && '❌'}
                                            {reserva.estado || 'Pendiente'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`estado-pago estado-pago-${getEstadoPago(reserva).clase}`} title={getEstadoPago(reserva).texto}>
                                            {getEstadoPago(reserva).icono} {getEstadoPago(reserva).texto}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-view"
                                                onClick={() => handleViewReserva(reserva)}
                                            >
                                                <FaEye /> Ver
                                            </button>
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEdit(reserva)}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(reserva.id)}
                                            >
                                                <FaTrash /> Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="reservas-section">
            <div className="section-header">
                <h2>Lista de Reservas</h2>
                <div className="editing-info">
                    <p className="info-text">
                        💡 <strong>Nota:</strong> Si no ves las reservas actualizadas, haz clic en "Actualizar Lista"
                    </p>
                </div>
                <div className="filters-container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, hospedaje o tipo..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                        {isSearching && <span className="searching-indicator">Buscando...</span>}
                    </div>
                    <div className="button-container">
                        <button className="btn-refresh" onClick={onRefresh}>
                            Actualizar Lista
                        </button>
                    </div>
                    <div className="filter-controls">
                        <select 
                            value={tipoHospedajeFilter} 
                            onChange={(e) => handleFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="todos">Todos los tipos</option>
                            <option value="cabaña">Cabañas</option>
                            <option value="dormis">Dormis</option>
                            <option value="camping">Camping</option>
                        </select>
                        <select 
                            value={filtroPagoPendiente} 
                            onChange={(e) => handleFiltroPagoPendiente(e.target.value)}
                            className="filter-select"
                            title="Filtrar por estado de pago"
                        >
                            <option value="todos">Todas las reservas</option>
                            <option value="pendientes">💰 Con pagos pendientes</option>
                            <option value="completas">✅ Completamente pagadas</option>
                        </select>
                    </div>
                    <div className="filtros-fecha-container">
                        <div className="filtro-fecha-grupo">
                            <label>Seleccionar Mes:</label>
                            <input
                                type="month"
                                value={mesSeleccionado}
                                onChange={(e) => handleMesChange(e.target.value)}
                                className="filtro-input-fecha"
                                placeholder="Seleccionar mes"
                            />
                            <small className="filtro-hint-fecha">Opcional: Selecciona un mes completo</small>
                        </div>
                        <div className="filtro-fecha-grupo">
                            <label>Fecha Inicio:</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => handleFechaInicioChange(e.target.value)}
                                className="filtro-input-fecha"
                            />
                        </div>
                        <div className="filtro-fecha-grupo">
                            <label>Fecha Fin:</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => handleFechaFinChange(e.target.value)}
                                className="filtro-input-fecha"
                                min={fechaInicio || undefined}
                            />
                        </div>
                        {(fechaInicio || fechaFin || mesSeleccionado) && (
                            <button 
                                onClick={limpiarFiltrosFecha}
                                className="btn-limpiar-fecha"
                                title="Limpiar filtros de fecha"
                            >
                                ✕ Limpiar fechas
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isMobile ? renderMobileView() : renderDesktopView()}

            {!isMobile && totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        ← Anterior
                    </button>
                    <span className="pagination-info">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Siguiente →
                    </button>
                </div>
            )}

            {/* Modal de detalles de reserva */}
            {isModalOpen && selectedReserva && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="reserva-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="reserva-modal-header">
                            <h2>Detalles de la Reserva #{selectedReserva.id}</h2>
                            <button className="reserva-modal-close" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="reserva-modal-body">
                            <div className="reserva-modal-grid">
                                <div className="reserva-modal-section">
                                    <h4>Información del Cliente</h4>
                                    <div className="reserva-modal-item">
                                        <strong>Nombre:</strong>
                                        <span>{selectedReserva.apellido}, {selectedReserva.nombre}</span>
                                    </div>
                                    {selectedReserva.documento && (
                                        <div className="reserva-modal-item">
                                            <strong>Documento:</strong>
                                            <span>{selectedReserva.documento}</span>
                                        </div>
                                    )}
                                    {selectedReserva.telefono && (
                                        <div className="reserva-modal-item">
                                            <strong>Teléfono:</strong>
                                            <span>{selectedReserva.telefono}</span>
                                        </div>
                                    )}
                                    {selectedReserva.modelo_vehiculo && (
                                        <div className="reserva-modal-item">
                                            <strong>Modelo Vehículo:</strong>
                                            <span>{selectedReserva.modelo_vehiculo}</span>
                                        </div>
                                    )}
                                    {selectedReserva.patente && (
                                        <div className="reserva-modal-item">
                                            <strong>Patente:</strong>
                                            <span>{selectedReserva.patente}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="reserva-modal-section">
                                    <h4>Detalles de la Reserva</h4>
                                    <div className="reserva-modal-item">
                                        <strong>Hospedaje:</strong>
                                        <span>{getHospedajeNombre(selectedReserva)}</span>
                                    </div>
                                    <div className="reserva-modal-item">
                                        <strong>Estado:</strong>
                                        <span className={`estado-badge estado-${(selectedReserva.estado || 'pendiente').toLowerCase()}`}>
                                            {selectedReserva.estado || 'Pendiente'}
                                        </span>
                                    </div>
                                    <div className="reserva-modal-item">
                                        <strong>Cantidad de Personas:</strong>
                                        <span>{selectedReserva.cantidad_personas}</span>
                                    </div>
                                </div>

                                <div className="reserva-modal-section">
                                    <h4>Fechas</h4>
                                    <div className="reserva-modal-item">
                                        <strong>Entrada:</strong>
                                        <span>{formatDate(selectedReserva.fecha_entrada)}</span>
                                    </div>
                                    <div className="reserva-modal-item">
                                        <strong>Salida:</strong>
                                        <span>{formatDate(selectedReserva.fecha_salida)}</span>
                                    </div>
                                    <div className="reserva-modal-item">
                                        <strong>Noches:</strong>
                                        <span>{calcularNoches(selectedReserva.fecha_entrada, selectedReserva.fecha_salida)} noche{calcularNoches(selectedReserva.fecha_entrada, selectedReserva.fecha_salida) !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                {/* Resumen de Pagos */}
                                <div className="reserva-modal-section reserva-modal-section-pagos">
                                    <ResumenPagos 
                                        reservaId={selectedReserva.id}
                                        montoTotal={selectedReserva.monto_total}
                                        descuento={selectedReserva.descuento || 0}
                                        refreshKey={refreshPagosKey}
                                    />
                                </div>

                                {selectedReserva.observaciones && (
                                    <div className="reserva-modal-section reserva-modal-observaciones">
                                        <h4>Observaciones</h4>
                                        <div className="reserva-modal-item">
                                            <span>{selectedReserva.observaciones}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de edición de reserva */}
            <EditarReservaModal
                reserva={editingReserva}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingReserva(null);
                }}
                onReservaUpdated={handleReservaUpdated}
                onRefresh={onRefresh}
                onPagoActualizado={() => {
                    // Forzar actualización de ResumenPagos cuando se actualiza un pago
                    setRefreshPagosKey(prev => prev + 1);
                }}
            />
        </div>
    );
};

export default ReservasList; 