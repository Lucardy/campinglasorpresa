import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUsers, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import './AdminNavbar.css';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="admin-navbar">
            <div className="admin-navbar-container">
                <div className="admin-navbar-logo">
                    <img src={logo} alt="Camping La Sorpresa" />
                    <span>Panel de Administración</span>
                </div>
                
                <div className="admin-navbar-links">
                    <Link 
                        to="/admin/calendario" 
                        className={`admin-nav-link ${isActive('/admin/calendario') ? 'active' : ''}`}
                    >
                        <FaCalendarAlt /> Calendario
                    </Link>
                    <Link 
                        to="/admin/reservas" 
                        className={`admin-nav-link ${isActive('/admin/reservas') ? 'active' : ''}`}
                    >
                        <FaClipboardList /> Reservas
                    </Link>
                    <Link 
                        to="/admin/clientes" 
                        className={`admin-nav-link ${isActive('/admin/clientes') ? 'active' : ''}`}
                    >
                        <FaUsers /> Clientes
                    </Link>
                </div>

                <div className="admin-navbar-actions">
                    <Link to="/" className="admin-nav-link">
                        <FaHome /> Volver al Sitio
                    </Link>
                    <button onClick={handleLogout} className="admin-nav-link logout">
                        <FaSignOutAlt /> Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar; 