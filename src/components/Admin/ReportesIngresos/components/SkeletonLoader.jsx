import React from 'react';

const SkeletonLoader = ({ tipo = 'tabla' }) => {
    if (tipo === 'tabla') {
        return (
            <div className="skeleton-container">
                <div className="skeleton-header">
                    <div className="skeleton-line skeleton-title"></div>
                </div>
                <div className="skeleton-table">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton-row">
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (tipo === 'cards') {
        return (
            <div className="skeleton-cards">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton-card">
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-content">
                            <div className="skeleton-line skeleton-small"></div>
                            <div className="skeleton-line skeleton-large"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="skeleton-loading">
            <div className="skeleton-spinner"></div>
            <p>Cargando reportes...</p>
        </div>
    );
};

export default SkeletonLoader;

