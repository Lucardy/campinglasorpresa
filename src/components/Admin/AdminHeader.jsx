import React from 'react';
import './AdminHeader.css';

const AdminHeader = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'calendario', label: 'Calendario' },
        { id: 'reservas', label: 'Reservas' },
        { id: 'clientes', label: 'Clientes' }
    ];

    return (
        <header className="admin-header">
            <h1>Panel de Administración</h1>
            <div className="tabs-container">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </header>
    );
};

export default AdminHeader; 