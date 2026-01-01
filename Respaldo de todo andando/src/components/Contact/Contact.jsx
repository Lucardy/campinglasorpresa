import React from 'react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaMapMarkerAlt, FaRoad, FaPhone, FaEnvelope, FaClock, FaCalendarAlt } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <h2>Contacto</h2>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-header">
                <FaMapMarkerAlt className="info-icon" />
                <h3>Ubicación</h3>
              </div>
              <div className="info-content">
                <p>Camino de La Colonia 385</p>
                <p>Carpintería, San Luis</p>
                <p className="reference">Referencia: a 300 metros de Ruta Nª 1 Km. 8</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">
                <FaClock className="info-icon" />
                <h3>Horarios</h3>
              </div>
              <div className="info-content">
                <p>Recepción: 8:00 a 20:00 hs</p>
                <p>Piscinas: 10:00 a 19:00 hs</p>
                <p className="highlight">Abierto todo el año</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">
                <FaPhone className="info-icon" />
                <h3>Teléfono</h3>
              </div>
              <div className="info-content">
                <p>+54 9 2664 639082</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">
                <FaEnvelope className="info-icon" />
                <h3>Email</h3>
              </div>
              <div className="info-content">
                <p>campinglasorpresa@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d708.1391218339827!2d-65.01656246615737!3d-32.40586075040844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2e36710d293e1%3A0xcf5832dd28be48ee!2sCamping%20La%20Sorpresa!5e0!3m2!1ses!2sar!4v1747886034507!5m2!1ses!2sar"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Camping La Sorpresa"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact; 