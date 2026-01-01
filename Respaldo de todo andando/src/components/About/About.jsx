import React from 'react';
import { FaTree, FaHome, FaBed, FaLeaf } from 'react-icons/fa';
import './About.css';

const About = () => {
  const scrollToServices = () => {
    const serviciosSection = document.getElementById('servicios');
    if (serviciosSection) {
      serviciosSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="section-page about-section" id="about">
      <div className="about-container">
        <div className="about-header" data-aos="fade-down">
          <h2>Bienvenidos al Camping La Sorpresa</h2>
          <div className="about-divider">
            <FaLeaf className="leaf-icon" />
          </div>
        </div>

        <div className="about-content">
          <div className="about-text" data-aos="fade-right">
            <p>
              El Complejo de Camping, Cabañas y Dormis está destinado para que disfrute de la Naturaleza y tranquilidad,
              y para ello contamos con una infraestructura destinada a satisfacer sus necesidades.
            </p>
            <p>
              Es un lugar muy tranquilo y de fácil acceso, atendido por sus propios dueños y brindando calidez y la mejor atención.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
              <FaTree className="feature-icon" />
              <h3>Naturaleza</h3>
              <p>Disfrute de un entorno natural único y preservado</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
              <FaHome className="feature-icon" />
              <h3>Comodidad</h3>
              <p>Infraestructura completa para su máxima comodidad</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
              <FaBed className="feature-icon" />
              <h3>Alojamiento</h3>
              <p>Múltiples opciones de alojamiento para cada necesidad</p>
            </div>
          </div>
        </div>

        <div className="about-cta" data-aos="fade-up" data-aos-delay="400">
          <button className="cta-button" onClick={scrollToServices}>
            Conocer más
          </button>
        </div>
      </div>
    </section>
  );
};

export default About; 