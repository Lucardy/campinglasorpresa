/**
 * Utilidades para obtener iconos según tipo de hospedaje o método de pago
 */
import React from 'react';
import { 
    FaHome,
    FaBed,
    FaUsers,
    FaMoneyBillWave,
    FaCreditCard
} from 'react-icons/fa';

/**
 * Obtiene el icono correspondiente al tipo de hospedaje
 * @param {string} tipo - Tipo de hospedaje
 * @returns {JSX.Element} Icono correspondiente
 */
export const getIconoTipoHospedaje = (tipo) => {
    switch ((tipo || '').toLowerCase()) {
        case 'cabaña':
            return <FaHome className="icono-cabaña" />;
        case 'camping':
            return <FaBed className="icono-camping" />;
        case 'dormis':
            return <FaUsers className="icono-dormis" />;
        case 'grupos':
            return <FaUsers className="icono-grupos" />;
        default:
            return <FaHome />;
    }
};

/**
 * Obtiene el icono correspondiente al método de pago
 * @param {string} metodo - Método de pago
 * @returns {JSX.Element} Icono correspondiente
 */
export const getIconoMetodoPago = (metodo) => {
    switch (metodo) {
        case 'efectivo':
            return <FaMoneyBillWave className="icono-efectivo" />;
        case 'transferencia':
            return <FaCreditCard className="icono-transferencia" />;
        default:
            return <FaMoneyBillWave />;
    }
};

