import React, { useState, useEffect } from 'react';
import './ReservasList.css';
import config from '../../../config';
import { notify } from '../Notifications/NotificationSystem';

const ReservasList = ({ reservas: initialReservas, onDelete, onAddNew }) => {
    const [reservas, setReservas] = useState(initialReservas);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('fecha_entrada');
    const [sortDirection, setSortDirection] = useState('desc');
    const [tipoHospedajeFilter, setTipoHospedajeFilter] = useState('todos');

    const itemsPerPage = config.ITEMS_PER_PAGE;

    useEffect(() => {
        setReservas(initialReservas);
        setCurrentPage(1);
    }, [initialReservas]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
        
        if (value.trim() === '') {
            setReservas(initialReservas);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`${config.API_URL}/reservas.php?search=${encodeURIComponent(value)}`);
            if (!response.ok) throw new Error('Error en la búsqueda');
            const data = await response.json();
            setReservas(data);
            if (data.length === 0) {
                notify.info('No se encontraron reservas con ese criterio de búsqueda');
            }
        } catch (error) {
            console.error('Error al buscar reservas:', error);
            notify.error('Error al buscar reservas');
            setReservas([]);
        } finally {
            setIsSearching(false);
        }
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

    const filteredReservas = reservas.filter(reserva => {
        return tipoHospedajeFilter === 'todos' || reserva.tipo_hospedaje === tipoHospedajeFilter;
    });

    const totalPages = Math.ceil(filteredReservas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReservas = filteredReservas.slice(startIndex, startIndex + itemsPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        try {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString('es-ES', options);
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '$0';
        try {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS'
            }).format(amount);
        } catch (error) {
            console.error('Error al formatear monto:', error);
            return '$0';
        }
    };

    const getClienteNombre = (reserva) => {
        if (!reserva.apellido || !reserva.nombre) {
            return 'Cliente no disponible';
        }
        return `${reserva.apellido}, ${reserva.nombre}`;
    };

    const getHospedajeNombre = (reserva) => {
        if (!reserva.tipo_hospedaje || !reserva.numero_hospedaje) {
            return 'Hospedaje no disponible';
        }
        return `${reserva.tipo_hospedaje} ${reserva.numero_hospedaje}`;
    };

    return (
        <div className="reservas-section">
            <div className="section-header">
                <h2>Lista de Reservas</h2>
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
                    </div>
                </div>
                <button className="btn-add" onClick={onAddNew}>
                    <span>➕</span> Nueva Reserva
                </button>
            </div>

            <div className="table-container">
                <table className="reservas-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('apellido')} className="sortable">
                                Cliente {sortField === 'apellido' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('fecha_entrada')} className="sortable">
                                Fecha Inicio {sortField === 'fecha_entrada' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('fecha_salida')} className="sortable">
                                Fecha Fin {sortField === 'fecha_salida' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('tipo_hospedaje')} className="sortable">
                                Hospedaje {sortField === 'tipo_hospedaje' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('monto_total')} className="sortable">
                                Monto {sortField === 'monto_total' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('estado')} className="sortable">
                                Estado {sortField === 'estado' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedReservas.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-results">
                                    {isSearching ? 'Buscando...' : 'No se encontraron reservas'}
                                </td>
                            </tr>
                        ) : (
                            paginatedReservas.map(reserva => (
                                <tr key={reserva.id}>
                                    <td>{getClienteNombre(reserva)}</td>
                                    <td>{formatDate(reserva.fecha_entrada)}</td>
                                    <td>{formatDate(reserva.fecha_salida)}</td>
                                    <td>{getHospedajeNombre(reserva)}</td>
                                    <td>{formatCurrency(reserva.monto_total)}</td>
                                    <td>
                                        <span className={`status-badge ${(reserva.estado || 'pendiente').toLowerCase()}`}>
                                            {reserva.estado === 'pendiente' && '⏳'}
                                            {reserva.estado === 'confirmada' && '✅'}
                                            {reserva.estado === 'cancelada' && '❌'}
                                            {reserva.estado || 'Pendiente'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-delete"
                                            onClick={() => handleDelete(reserva.id)}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
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
        </div>
    );
};

export default ReservasList; 