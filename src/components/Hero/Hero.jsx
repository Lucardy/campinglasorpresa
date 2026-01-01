import React from 'react';
import './Hero.css';

const Hero = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '5492664639082';
    const url = `https://api.whatsapp.com/send/?phone=${phoneNumber}`;
    window.open(url, '_blank');
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-container">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Camping La Sorpresa</h1>
          <p>Tu escape perfecto a la naturaleza</p>
          <button className="cta-button" onClick={handleWhatsAppClick}>
            Reservar Ahora
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero; 