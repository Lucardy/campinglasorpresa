import React, { useState } from 'react';
import { FaUser, FaUserCircle, FaUserCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (formData.username === 'admin' && formData.password === 'admin') {
      login();
      setShowModal(false);
      setError('');
      navigate('/admin');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleGoToAdmin = () => {
    setShowUserMenu(false);
    navigate('/admin');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      {!isAuthenticated ? (
        <button 
          className="login-button" 
          onClick={() => setShowModal(true)}
          aria-label="Iniciar sesión"
        >
          <FaUser size={24} />
        </button>
      ) : (
        <div className="user-menu-container">
          <button 
            className="login-button logged-in" 
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menú de usuario"
          >
            <FaUserCircle size={24} />
          </button>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <span className="user-name">Admin</span>
                <button 
                  className="close-button" 
                  onClick={() => setShowUserMenu(false)}
                  aria-label="Cerrar menú"
                >
                  ×
                </button>
              </div>
              <div className="user-menu-content">
                <button 
                  className="user-menu-item" 
                  onClick={handleGoToAdmin}
                >
                  <FaUserCog className="menu-icon" />
                  Panel de Administración
                </button>
                <button 
                  className="user-menu-item" 
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="menu-icon" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="login-overlay" onClick={() => setShowModal(false)}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <button 
              className="close-button" 
              onClick={() => setShowModal(false)}
              aria-label="Cerrar modal"
            >
              ×
            </button>
            <h2>Iniciar Sesión</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 