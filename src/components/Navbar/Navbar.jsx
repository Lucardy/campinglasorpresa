import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Login from '../Login/Login';
import './Navbar.css';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavClick = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    closeMenu();
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => handleNavClick('hero')}>
          <img src={logo} alt="Logo Complejo La Sorpresa" />
          <span>Complejo La Sorpresa</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => handleNavClick('hero')}>
              Inicio
            </Link>
          </li>
          <li className="nav-item">
            {isHomePage ? (
              <button 
                className="nav-link" 
                onClick={() => handleNavClick('about')}
              >
                Sobre Nosotros
              </button>
            ) : (
              <Link to="/#about" className="nav-link" onClick={() => handleNavClick('about')}>
                Sobre Nosotros
              </Link>
            )}
          </li>
          <li className="nav-item">
            {isHomePage ? (
              <button 
                className="nav-link" 
                onClick={() => handleNavClick('servicios')}
              >
                Servicios
              </button>
            ) : (
              <Link to="/#servicios" className="nav-link" onClick={() => handleNavClick('servicios')}>
                Servicios
              </Link>
            )}
          </li>
          <li className="nav-item">
            <Link to="/cabanas" className="nav-link" onClick={closeMenu}>
              Cabañas
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/dormis" className="nav-link" onClick={closeMenu}>
              Dormis
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/camping" className="nav-link" onClick={closeMenu}>
              Camping
            </Link>
          </li>
          <li className="nav-item">
            {isHomePage ? (
              <button 
                className="nav-link" 
                onClick={() => handleNavClick('contact')}
              >
                Contacto
              </button>
            ) : (
              <Link to="/#contact" className="nav-link" onClick={() => handleNavClick('contact')}>
                Contacto
              </Link>
            )}
          </li>
          <li className="nav-item login-item">
            <Login onLoginSuccess={closeMenu} />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 