import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaTrash, FaEye } from 'react-icons/fa';
import './ClientesList.css';
import config from '../../../config';
import { notify } from '../Notifications/NotificationSystem';
import ClienteModal from './ClienteModal';

const ClientesList = ({ clientes: initialClientes, onDelete, onAddNew, onRefresh, onUpdate, onClientDeleted }) => {
    const [clientes, setClientes] = useState(initialClientes);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('apellido');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [lastSearchTerm, setLastSearchTerm] = useState('');

    const itemsPerPage = config.ITEMS_PER_PAGE;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setClientes(initialClientes);
        setCurrentPage(1);
    }, [initialClientes]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Limpiar timeout anterior si existe
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (!value.trim()) {
            setClientes(initialClientes);
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
                console.log('🔍 Buscando clientes con URL:', `${config.API_URL}/clientes.php?search=${encodeURIComponent(value)}`);
                const response = await fetch(`${config.API_URL}/clientes.php?search=${encodeURIComponent(value)}`);
                console.log('🔍 Respuesta de la API:', response.status, response.statusText);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('🔍 Error en la respuesta:', errorText);
                    // Fallback a búsqueda local si la API falla
                    console.log('🔄 Usando búsqueda local como fallback...');
                    const searchTermLower = value.toLowerCase();
                    const filtered = initialClientes.filter(cliente => 
                        (cliente.nombre?.toLowerCase() || '').includes(searchTermLower) ||
                        (cliente.apellido?.toLowerCase() || '').includes(searchTermLower) ||
                        (cliente.documento?.toLowerCase() || '').includes(searchTermLower) ||
                        (cliente.telefono?.toLowerCase() || '').includes(searchTermLower)
                    );
                    setClientes(filtered);
                    if (filtered.length === 0 && shouldShowNotification) {
                        notify.info('No se encontraron clientes con ese criterio de búsqueda');
                    }
                    return;
                }
                
                const data = await response.json();
                console.log('🔍 Datos recibidos:', data);
                
                // Verificar si los datos de la API son problemáticos
                const apiIds = data.map(c => c.id);
                const initialIds = initialClientes.map(c => c.id);
                const clientesProblematicos = apiIds.filter(id => !initialIds.includes(id));
                
                if (clientesProblematicos.length > 0) {
                    console.warn('⚠️ API devolvió clientes problemáticos:', clientesProblematicos);
                    console.log('🔄 Usando búsqueda local para evitar datos fantasma...');
                    // Usar búsqueda local en lugar de datos de la API
                    const searchTermLower = value.toLowerCase();
                    const filtered = initialClientes.filter(cliente => 
                        (cliente.nombre?.toLowerCase() || '').includes(searchTermLower) ||
                        (cliente.apellido?.toLowerCase() || '').includes(searchTermLower) ||
                        (cliente.documento?.toLowerCase() || '').includes(searchTermLower) ||
                        (cliente.telefono?.toLowerCase() || '').includes(searchTermLower)
                    );
                    setClientes(filtered);
                    if (filtered.length === 0 && shouldShowNotification) {
                        notify.info('No se encontraron clientes con ese criterio de búsqueda');
                    }
                    return;
                }
                
                setClientes(data);
                if (data.length === 0 && shouldShowNotification) {
                    notify.info('No se encontraron clientes con ese criterio de búsqueda');
                }
            } catch (error) {
                console.error('🔍 Error al buscar clientes:', error);
                // Fallback a búsqueda local si hay error de red
                console.log('🔄 Usando búsqueda local como fallback...');
                const searchTermLower = value.toLowerCase();
                const filtered = initialClientes.filter(cliente => 
                    (cliente.nombre?.toLowerCase() || '').includes(searchTermLower) ||
                    (cliente.apellido?.toLowerCase() || '').includes(searchTermLower) ||
                    (cliente.documento?.toLowerCase() || '').includes(searchTermLower) ||
                    (cliente.telefono?.toLowerCase() || '').includes(searchTermLower)
                );
                setClientes(filtered);
                if (filtered.length === 0 && shouldShowNotification) {
                    notify.info('No se encontraron clientes con ese criterio de búsqueda');
                }
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms de delay
        
        setSearchTimeout(timeout);
    };

    const handleSort = (field) => {
        const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        const sorted = [...clientes].sort((a, b) => {
            let valueA = a[field]?.toLowerCase() || '';
            let valueB = b[field]?.toLowerCase() || '';

            if (newDirection === 'asc') {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
            }
        });

        setClientes(sorted);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            return;
        }

        try {
            const response = await fetch(`${config.API_URL}/clientes.php?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el cliente');
            }

            setClientes(prevClientes => prevClientes.filter(cliente => cliente.id !== id));
            notify.success('Cliente eliminado exitosamente');
            // Actualizar la lista global de clientes
            if (onClientDeleted) {
                onClientDeleted();
            }
        } catch (error) {
            console.error('Error:', error);
            notify.error('Error al eliminar el cliente');
        }
    };

    const handleEdit = (cliente) => {
        setEditingId(cliente.id);
        setEditingData({
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            documento: cliente.documento,
            telefono: cliente.telefono,
            modelo_vehiculo: cliente.modelo_vehiculo || '',
            patente: cliente.patente || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingData({});
    };

    const handleSaveEdit = async (id) => {
        try {
            const response = await fetch(`${config.API_URL}/clientes.php?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingData)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el cliente');
            }

            const updatedCliente = await response.json();
            
            // Actualizar estado global
            if (onUpdate) {
                await onUpdate();
            }
            
            setEditingId(null);
            setEditingData({});
            notify.success('Cliente actualizado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            notify.error('Error al actualizar el cliente');
        }
    };

    const handleInputChange = (field, value) => {
        setEditingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleViewCliente = (cliente) => {
        setSelectedCliente(cliente);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
    };

    const filteredClientes = clientes;
    const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClientes = filteredClientes.slice(startIndex, startIndex + itemsPerPage);

    const formatPhone = (phone) => {
        if (!phone) return 'No disponible';
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderMobileView = () => {
        const recentClientes = paginatedClientes.slice(0, 3);
        
        return (
            <div className="mobile-clientes">
                {recentClientes.map((cliente) => (
                    <div key={cliente.id} className="cliente-card">
                        {editingId === cliente.id ? (
                            // Vista de edición móvil
                            <div className="mobile-edit-form">
                                <div className="edit-header">
                                    <h3>Editando Cliente</h3>
                                </div>
                                <div className="edit-fields">
                                    <div className="edit-field">
                                        <label>Apellido:</label>
                                        <input
                                            type="text"
                                            value={editingData.apellido}
                                            onChange={(e) => handleInputChange('apellido', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mobile-edit-input"
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Nombre:</label>
                                        <input
                                            type="text"
                                            value={editingData.nombre}
                                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mobile-edit-input"
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>DNI:</label>
                                        <input
                                            type="text"
                                            value={editingData.documento}
                                            onChange={(e) => handleInputChange('documento', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mobile-edit-input"
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Teléfono:</label>
                                        <input
                                            type="text"
                                            value={editingData.telefono}
                                            onChange={(e) => handleInputChange('telefono', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mobile-edit-input"
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Vehículo:</label>
                                        <input
                                            type="text"
                                            value={editingData.modelo_vehiculo}
                                            onChange={(e) => handleInputChange('modelo_vehiculo', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mobile-edit-input"
                                        />
                                    </div>
                                    <div className="edit-field">
                                        <label>Patente:</label>
                                        <input
                                            type="text"
                                            value={editingData.patente}
                                            onChange={(e) => handleInputChange('patente', e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mobile-edit-input"
                                        />
                                    </div>
                                </div>
                                <div className="edit-actions" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        className="btn-save"
                                        onClick={() => handleSaveEdit(cliente.id)}
                                    >
                                        <FaSave /> Guardar
                                    </button>
                                    <button 
                                        className="btn-cancel"
                                        onClick={handleCancelEdit}
                                    >
                                        <FaTimes /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Vista normal móvil
                            <>
                                <div className="cliente-header">
                                    <h3>{`${cliente.apellido}, ${cliente.nombre}`}</h3>
                                    <span className="dni-badge">
                                        DNI: {cliente.documento}
                                    </span>
                                </div>
                                <div className="cliente-details">
                                    <div className="detail-row">
                                        <span className="label">Teléfono:</span>
                                        <span className="value">{formatPhone(cliente.telefono)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Vehículo:</span>
                                        <span className="value">{cliente.modelo_vehiculo || 'No especificado'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Patente:</span>
                                        <span className="value">{cliente.patente || 'No especificada'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Fecha de registro:</span>
                                        <span className="value">{formatDate(cliente.created_at)}</span>
                                    </div>
                                </div>
                                <div className="cliente-actions" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        className="btn-view"
                                        onClick={() => handleViewCliente(cliente)}
                                    >
                                        <FaEye /> Ver
                                    </button>
                                    <button 
                                        className="btn-edit"
                                        onClick={() => handleEdit(cliente)}
                                    >
                                        <FaEdit /> Editar
                                    </button>
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDelete(cliente.id)}
                                    >
                                        <FaTrash /> Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {paginatedClientes.length > 3 && (
                    <div className="view-more">
                        <p>Hay {paginatedClientes.length - 3} clientes más. Usa el buscador para encontrarlos.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderDesktopView = () => {
        return (
            <div className="table-container">
                <table className="clientes-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('apellido')} className="sortable">
                                Apellido {sortField === 'apellido' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('nombre')} className="sortable">
                                Nombre {sortField === 'nombre' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('documento')} className="sortable">
                                DNI {sortField === 'documento' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('telefono')} className="sortable">
                                Teléfono {sortField === 'telefono' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('modelo_vehiculo')} className="sortable">
                                Vehículo {sortField === 'modelo_vehiculo' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('patente')} className="sortable">
                                Patente {sortField === 'patente' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('created_at')} className="sortable">
                                Fecha de registro {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedClientes.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-results">
                                    {isSearching ? 'Buscando...' : 'No se encontraron clientes'}
                                </td>
                            </tr>
                        ) : (
                            paginatedClientes.map((cliente) => (
                                <tr 
                                    key={cliente.id} 
                                    className="cliente-row"
                                    onClick={editingId === cliente.id ? undefined : () => handleViewCliente(cliente)}
                                    style={{ cursor: editingId === cliente.id ? 'default' : 'pointer' }}
                                >
                                    <td>
                                        {editingId === cliente.id ? (
                                            <input
                                                type="text"
                                                value={editingData.apellido}
                                                onChange={(e) => handleInputChange('apellido', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="edit-input"
                                            />
                                        ) : (
                                            cliente.apellido
                                        )}
                                    </td>
                                    <td>
                                        {editingId === cliente.id ? (
                                            <input
                                                type="text"
                                                value={editingData.nombre}
                                                onChange={(e) => handleInputChange('nombre', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="edit-input"
                                            />
                                        ) : (
                                            cliente.nombre
                                        )}
                                    </td>
                                    <td>
                                        {editingId === cliente.id ? (
                                            <input
                                                type="text"
                                                value={editingData.documento}
                                                onChange={(e) => handleInputChange('documento', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="edit-input"
                                            />
                                        ) : (
                                            cliente.documento
                                        )}
                                    </td>
                                    <td>
                                        {editingId === cliente.id ? (
                                            <input
                                                type="text"
                                                value={editingData.telefono}
                                                onChange={(e) => handleInputChange('telefono', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="edit-input"
                                            />
                                        ) : (
                                            formatPhone(cliente.telefono)
                                        )}
                                    </td>
                                    <td>
                                        {editingId === cliente.id ? (
                                            <input
                                                type="text"
                                                value={editingData.modelo_vehiculo}
                                                onChange={(e) => handleInputChange('modelo_vehiculo', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="edit-input"
                                            />
                                        ) : (
                                            cliente.modelo_vehiculo || '-'
                                        )}
                                    </td>
                                    <td>
                                        {editingId === cliente.id ? (
                                            <input
                                                type="text"
                                                value={editingData.patente}
                                                onChange={(e) => handleInputChange('patente', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="edit-input"
                                            />
                                        ) : (
                                            cliente.patente || '-'
                                        )}
                                    </td>
                                    <td>{formatDate(cliente.created_at)}</td>
                                    <td>
                                        {editingId === cliente.id ? (
                                            <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    className="btn-save"
                                                    onClick={() => handleSaveEdit(cliente.id)}
                                                >
                                                    <FaSave /> Guardar
                                                </button>
                                                <button 
                                                    className="btn-cancel"
                                                    onClick={handleCancelEdit}
                                                >
                                                    <FaTimes /> Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    className="btn-view"
                                                    onClick={() => handleViewCliente(cliente)}
                                                >
                                                    <FaEye /> Ver
                                                </button>
                                                <button 
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(cliente)}
                                                >
                                                    <FaEdit /> Editar
                                                </button>
                                                <button 
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(cliente.id)}
                                                >
                                                    <FaTrash /> Eliminar
                                                </button>
                                            </div>
                                        )}
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
        <div className="clientes-section">
            <div className="section-header">
                <h2>Lista de Clientes</h2>
                <div className="editing-info">
                    <p className="info-text">
                        💡 <strong>Nota:</strong> Si no ves los clientes actualizados, haz clic en "Actualizar Lista"
                    </p>
                </div>
                <div className="filters-container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, apellido, DNI o teléfono..."
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
                        <button className="btn-add" onClick={onAddNew}>
                            Nuevo Cliente
                        </button>
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

            <ClienteModal 
                cliente={selectedCliente}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default ClientesList; 