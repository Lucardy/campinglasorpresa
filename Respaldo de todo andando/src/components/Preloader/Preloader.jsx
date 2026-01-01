import React, { useEffect, useState } from 'react';
import './Preloader.css';
import logo from '../../assets/logo.jpeg';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular tiempo de carga
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="preloader">
      <div className="preloader-content">
        <div className="logo-container">
          <img src={logo} alt="Camping La Sorpresa" className="preloader-logo" />
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p className="loading-text">Cargando...</p>
      </div>
    </div>
  );
};

export default Preloader; 