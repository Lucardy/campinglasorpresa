import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useAdmin from './hooks/useAdmin';
import AdminNavbar from './AdminNavbar';
import CalendarioReservas from './CalendarioReservas/CalendarioReservas';
import ClientesList from './Clientes/ClientesList';
import ReservaForm from './ReservaForm/ReservaForm';
import ReservasList from './ReservasList/ReservasList';
import ClienteForm from './Clientes/ClienteForm';
import GestionPrecios from './GestionPrecios/GestionPrecios';
import ReportesIngresos from './ReportesIngresos/ReportesIngresos';
import ReservaRapida from './ReservaRapida/ReservaRapidaRefactorizada';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import cacheManager from '../../utils/cacheManager';
import './Admin.css';

const Admin = () => {
    console.log('🔧 Admin: Componente montado');
    console.log('🔧 Admin: URL actual:', window.location.href);
    console.log('🔧 Admin: Pathname:', window.location.pathname);
    
    const navigate = useNavigate();
    const {
        clientes,
        reservas,
        error,
        handleCreateCliente,
        handleDeleteCliente,
        handleCreateReserva,
        handleUpdateReserva,
        handleDeleteReserva,
        fetchClientes,
        fetchReservas,
        forceReload
    } = useAdmin();
    const [showReservaForm, setShowReservaForm] = useState(false);
    const [showClienteForm, setShowClienteForm] = useState(false);



    console.log('🔧 Admin: Componente Admin montado correctamente');
    
    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {/* Botón discreto para limpiar cache */}
                <div style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    zIndex: 1000
                }}>
                    <button
                        onClick={() => {
                            cacheManager.forzarLimpieza();
                            window.location.reload();
                        }}
                        style={{
                            background: 'rgba(0,0,0,0.1)',
                            color: '#666',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Limpiar cache"
                    >
                        🧹
                    </button>
                </div>
                

                

                
                <Routes>
                    <Route path="calendario" element={
                        <CalendarioReservas 
                            reservas={reservas}
                            onRefresh={forceReload}
                            onUpdateReserva={handleUpdateReserva}
                            onDeleteReserva={handleDeleteReserva}
                        />
                    } />
                    <Route path="reserva-rapida" element={
                        <ReservaRapida />
                    } />
                    <Route path="clientes" element={
                        <>
                            <ClientesList 
                                clientes={clientes}
                                onDelete={handleDeleteCliente}
                                onAddNew={() => setShowClienteForm(true)}
                                onRefresh={forceReload}
                                onUpdate={forceReload}
                                onClientDeleted={fetchClientes}
                            />
                            {showClienteForm && (
                                <ClienteForm 
                                    onClose={() => setShowClienteForm(false)}
                                    onClienteAdded={handleCreateCliente}
                                />
                            )}
                        </>
                    } />
                    <Route path="reservas" element={
                    <>
                        {showReservaForm && (
                            <ReservaForm 
                                onClose={() => {
                                    setShowReservaForm(false);
                                    // Actualizar la lista de reservas después de cerrar el formulario
                                    fetchReservas();
                                }}
                                onSuccess={handleCreateReserva}
                                clientes={clientes}
                            />
                        )}
                            <div className="reservas-container">
                                <button 
                                    className="action-button"
                                    onClick={() => setShowReservaForm(true)}
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="24" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    Nueva Reserva
                                </button>
                            </div>
                        <ReservasList 
                            reservas={reservas}
                            onRefresh={forceReload}
                            onUpdate={handleUpdateReserva}
                            onDelete={handleDeleteReserva}
                        />
                    </>
                    } />
                    <Route path="precios" element={<GestionPrecios />} />
                    <Route path="reportes" element={<ReportesIngresos />} />
                    <Route path="/" element={
                        <CalendarioReservas 
                            reservas={reservas}
                            onRefresh={forceReload}
                            onUpdateReserva={handleUpdateReserva}
                            onDeleteReserva={handleDeleteReserva}
                        />
                    } />
                </Routes>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Admin; 