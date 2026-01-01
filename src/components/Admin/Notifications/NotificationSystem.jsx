import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuración personalizada para las notificaciones
const defaultOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

// Funciones de utilidad para mostrar diferentes tipos de notificaciones
export const notify = {
    success: (message) => {
        toast.success(message, {
            ...defaultOptions,
            icon: "✅"
        });
    },
    error: (message) => {
        toast.error(message, {
            ...defaultOptions,
            autoClose: 5000,
            icon: "❌"
        });
    },
    warning: (message) => {
        toast.warning(message, {
            ...defaultOptions,
            icon: "⚠️"
        });
    },
    info: (message) => {
        toast.info(message, {
            ...defaultOptions,
            icon: "ℹ️"
        });
    }
};

// Componente contenedor de notificaciones
const NotificationSystem = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
    );
};

export default NotificationSystem; 