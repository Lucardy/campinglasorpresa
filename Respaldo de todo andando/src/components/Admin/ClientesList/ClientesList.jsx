import React, { useState, useEffect } from 'react';
import './ClientesList.css';
import config from '../../../config';
import { notify } from '../Notifications/NotificationSystem';
import { CLIENTE_FIELDS } from '../../../constants/fields';

const ClientesList = ({ clientes: initialClientes, onDelete, onAddNew }) => {
    const [clientes, setClientes] = useState(initialClientes);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState(CLIENTE_FIELDS.APELLIDO);
    const [sortDirection, setSortDirection] = useState('asc');

    const itemsPerPage = config.ITEMS_PER_PAGE;

    useEffect(() => {
        setClientes(initialClientes);
        setCurrentPage(1);
    }, [initialClientes]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
        
        if (value.trim() === '') {
            setClientes(initialClientes);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`${config.API_URL}/clientes.php?search=${encodeURIComponent(value)}`);
            if (!response.ok) throw new Error('Error en la búsqueda');
            const data = await response.json();
            setClientes(data);
            if (data.length === 0) {
                notify.info('No se encontraron clientes con ese criterio de búsqueda');
            }
        } catch (error) {
            console.error('Error al buscar clientes:', error);
            notify.error('Error al buscar clientes');
            setClientes([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSort = (field) => {
        const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);

        const sortedClientes = [...clientes].sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            if (direction === 'asc') {
                return valueA > valueB ? 1 : -1;
            }
            return valueA < valueB ? 1 : -1;
        });

        setClientes(sortedClientes);
        notify.info(`Lista ordenada por ${field} ${direction === 'asc' ? 'ascendente' : 'descendente'}`);
    };

    const totalPages = Math.ceil(clientes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClientes = clientes.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="clientes-section">
            <div className="section-header">
                <h2>Lista de Clientes</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o documento..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    {isSearching && <span className="searching-indicator">Buscando...</span>}
                </div>
                <button className="btn-add" onClick={onAddNew}>
                    Nuevo Cliente
                </button>
            </div>

            <div className="table-container">
                <table className="clientes-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort(CLIENTE_FIELDS.APELLIDO)} className="sortable">
                                Apellido {sortField === CLIENTE_FIELDS.APELLIDO && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort(CLIENTE_FIELDS.NOMBRE)} className="sortable">
                                Nombre {sortField === CLIENTE_FIELDS.NOMBRE && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort(CLIENTE_FIELDS.DOCUMENTO)} className="sortable">
                                Documento {sortField === CLIENTE_FIELDS.DOCUMENTO && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort(CLIENTE_FIELDS.TELEFONO)} className="sortable">
                                Teléfono {sortField === CLIENTE_FIELDS.TELEFONO && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort(CLIENTE_FIELDS.MODELO_VEHICULO)} className="sortable">
                                Vehículo {sortField === CLIENTE_FIELDS.MODELO_VEHICULO && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort(CLIENTE_FIELDS.PATENTE)} className="sortable">
                                Patente {sortField === CLIENTE_FIELDS.PATENTE && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedClientes.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-results">
                                    {isSearching ? 'Buscando...' : 'No se encontraron clientes'}
                                </td>
                            </tr>
                        ) : (
                            paginatedClientes.map(cliente => (
                                <tr key={cliente[CLIENTE_FIELDS.ID]}>
                                    <td>{cliente[CLIENTE_FIELDS.APELLIDO]}</td>
                                    <td>{cliente[CLIENTE_FIELDS.NOMBRE]}</td>
                                    <td>{cliente[CLIENTE_FIELDS.DOCUMENTO]}</td>
                                    <td>{cliente[CLIENTE_FIELDS.TELEFONO]}</td>
                                    <td>{cliente[CLIENTE_FIELDS.MODELO_VEHICULO]}</td>
                                    <td>{cliente[CLIENTE_FIELDS.PATENTE]}</td>
                                    <td>
                                        <button 
                                            className="btn-delete"
                                            onClick={() => onDelete(cliente[CLIENTE_FIELDS.ID])}
                                        >
                                            Eliminar
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
                        Anterior
                    </button>
                    <span className="pagination-info">
                        Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, clientes.length)} de {clientes.length} clientes
                        <br />
                        Página {currentPage} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClientesList; 