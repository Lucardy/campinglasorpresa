import React from 'react';
import GestionPagos from '../GestionPagos';

/**
 * Componente wrapper para la sección de gestión de pagos
 */
const GestionPagosSection = ({
    reservaId,
    montoTotal,
    onPagoActualizado,
    onRefresh,
    setRefreshReserva
}) => {
    return (
        <div className="form-section gestion-pagos-section">
            <GestionPagos
                reservaId={reservaId}
                montoTotal={montoTotal}
                onPagoActualizado={async () => {
                    // Refrescar la lista de reservas para actualizar total_pagado y estado_pago
                    if (onRefresh) {
                        await onRefresh();
                    }
                    setRefreshReserva(prev => prev + 1);
                    // Notificar al componente padre para actualizar ResumenPagos
                    if (onPagoActualizado) {
                        onPagoActualizado();
                    }
                }}
            />
        </div>
    );
};

export default GestionPagosSection;

