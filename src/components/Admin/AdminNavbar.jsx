import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    FaHome, 
    FaCalendarAlt, 
    FaUsers, 
    FaSignOutAlt, 
    FaClipboardList, 
    FaMoneyBillWave, 
    FaChartLine,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import './AdminNavbar.css';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 900);
            if (window.innerWidth >= 900) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMenuOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen, isMobile]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { to: '/admin/calendario', icon: <FaCalendarAlt />, text: 'Calendario' },
        { to: '/admin/reserva-rapida', icon: <FaClipboardList />, text: 'Reserva Rápida' },
        { to: '/admin/reservas', icon: <FaClipboardList />, text: 'Reservas' },
        { to: '/admin/clientes', icon: <FaUsers />, text: 'Clientes' },
        { to: '/admin/precios', icon: <FaMoneyBillWave />, text: 'Precios' },
        { to: '/admin/reportes', icon: <FaChartLine />, text: 'Reportes' }
    ];

    return (
        <nav className="admin-navbar">
            {/* Overlay solo para móvil */}
            {isMobile && (
                <div 
                    className={`menu-overlay${isMenuOpen ? ' open' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
            <div className="admin-navbar-container">
                <div className="admin-navbar-logo">
                    <img src={logo} alt="Camping La Sorpresa" />
                    <span className="logo-text">Panel de Administración</span>
                </div>
                {/* Menú horizontal (desktop/tablet) */}
                {!isMobile && (
                    <>
                        <ul className="admin-navbar-links">
                            {navLinks.map((link) => (
                                <li key={link.to}>
                                    <Link 
                                        to={link.to} 
                                        className={`admin-nav-link${isActive(link.to) ? ' active' : ''}`}
                                    >
                                        {link.icon} {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="admin-navbar-actions">
                            <Link to="/" className="admin-nav-link">
                                <FaHome /> Volver al Sitio
                            </Link>
                            <button onClick={handleLogout} className="admin-nav-link logout">
                                <FaSignOutAlt /> Cerrar Sesión
                            </button>
                        </div>
                    </>
                )}
                {/* Botón hamburguesa solo en móvil */}
                {isMobile && (
                    <button 
                        className="hamburger-menu"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Abrir menú"
                    >
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                )}
                {/* Menú móvil */}
                {isMobile && isMenuOpen && (
                    <div className="admin-navbar-mobile-menu">
                        <div className="admin-navbar-logo mobile">
                            <img src={logo} alt="Camping La Sorpresa" />
                        </div>
                        <ul className="admin-navbar-mobile-links">
                            {navLinks.map((link) => (
                                <li key={link.to}>
                                    <Link 
                                        to={link.to} 
                                        className={`admin-nav-link${isActive(link.to) ? ' active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.icon} {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="admin-navbar-mobile-actions">
                            <Link to="/" className="admin-nav-link" onClick={() => setIsMenuOpen(false)}>
                                <FaHome /> Volver al Sitio
                            </Link>
                            <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="admin-nav-link logout">
                                <FaSignOutAlt /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default AdminNavbar; 