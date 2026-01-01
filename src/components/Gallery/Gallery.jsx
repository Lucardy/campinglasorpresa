import React, { useState, useEffect } from 'react';
import './Gallery.css';

const Gallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseOverlay = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape' && selectedImage) {
      handleCloseOverlay();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage]);

  if (isLoading) {
    return (
      <div className="gallery-grid loading">
        {images.map((_, idx) => (
          <div key={idx} className="gallery-item loading">
            <div className="loading-placeholder"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="gallery-wrapper">
      <div className={`gallery-grid${selectedImage ? ' blur-background' : ''}`}>
        {images && images.length > 0 ? (
          images.map((img, idx) => (
            <div
              key={idx}
              className="gallery-item"
              onClick={() => handleImageClick(img)}
              role="button"
              tabIndex={0}
              onKeyPress={e => e.key === 'Enter' && handleImageClick(img)}
            >
              <img src={img} alt={`Imagen ${idx + 1}`} className="gallery-img" loading="lazy" />
            </div>
          ))
        ) : (
          <p className="gallery-empty">Próximamente imágenes...</p>
        )}
      </div>
      {selectedImage && (
        <div
          className="gallery-overlay"
          onClick={handleCloseOverlay}
          role="button"
          tabIndex={0}
          onKeyPress={e => e.key === 'Enter' && handleCloseOverlay()}
        >
          <button
            className="gallery-close"
            onClick={handleCloseOverlay}
            aria-label="Cerrar imagen"
          >
            ×
          </button>
          <img src={selectedImage} alt="Imagen ampliada" className="gallery-enlarged" />
        </div>
      )}
    </div>
  );
};

export default Gallery; 