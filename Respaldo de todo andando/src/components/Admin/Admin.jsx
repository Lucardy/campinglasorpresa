import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAdmin from './hooks/useAdmin';
import AdminNavbar from './AdminNavbar';
import CalendarioReservas from './CalendarioReservas/CalendarioReservas';
import ClientesList from './ClientesList/ClientesList';
import ReservaForm from './ReservaForm/ReservaForm';
import ReservasList from './ReservaForm/ReservasList';
import ClienteForm from './ClientesList/ClienteForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Admin.css';

const Admin = () => {
    const { 
        clientes, 
        reservas,
        error, 
        handleCreateCliente, 
        handleDeleteCliente,
        handleDeleteReserva,
        fetchReservas
    } = useAdmin();
    const [showClienteForm, setShowClienteForm] = useState(false);
    const [showReservaForm, setShowReservaForm] = useState(false);

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                <Routes>
                    <Route path="/calendario" element={<CalendarioReservas />} />
                    <Route path="/clientes" element={
                        <ClientesList 
                            clientes={clientes}
                            onDelete={handleDeleteCliente}
                            onAddNew={() => setShowClienteForm(true)}
                        />
                    } />
                    <Route path="/reservas" element={
                        <>
                            {showReservaForm && (
                                <ReservaForm 
                                    onClose={() => setShowReservaForm(false)}
                                    onReservaAdded={fetchReservas}
                                />
                            )}
                            <div className="reservas-container">
                                <button 
                                    className="action-button"
                                    onClick={() => setShowReservaForm(true)}
                                >
                                    Nueva Reserva
                                </button>
                            </div>
                            <ReservasList 
                                reservas={reservas}
                                onDelete={handleDeleteReserva}
                            />
                        </>
                    } />
                    <Route path="/" element={<CalendarioReservas />} />
                </Routes>
            </div>
            {showClienteForm && (
                <ClienteForm 
                    onClose={() => setShowClienteForm(false)}
                    onClienteAdded={handleCreateCliente}
                />
            )}
            <ToastContainer />
        </div>
    );
};

export default Admin; 