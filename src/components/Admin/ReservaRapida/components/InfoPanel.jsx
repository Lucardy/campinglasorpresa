import React from 'react';

const InfoPanel = () => {
    return (
        <div className="info-panel">
            <h4>💡 Consejos de uso:</h4>
            <ul>
                <li>Comienza ingresando el documento del cliente</li>
                <li>Si el cliente ya existe, se autocompletarán los datos</li>
                <li>Si es nuevo, completa todos los campos obligatorios</li>
                <li>Selecciona el tipo de hospedaje y luego el número específico</li>
                <li>Después elige la cantidad de personas según el hospedaje seleccionado</li>
                <li><strong>👥 Las cantidades de personas se adaptan automáticamente</strong> según el tipo de hospedaje seleccionado</li>
                <li><strong>💰 El monto total se calcula automáticamente</strong> basado en el tipo de hospedaje, cantidad de personas, fechas y método de pago</li>
                <li><strong>💳 Selecciona el método de pago</strong> (efectivo o transferencia) ya que los precios pueden variar</li>
                <li><strong>💸 Puedes aplicar una seña</strong> al monto total si es necesario (opcional)</li>
                <li><strong>🏕️ Para camping:</strong> ingresa adultos y menores por separado, el sistema calculará automáticamente el precio (no requiere número de hospedaje)</li>
                <li><strong>👥 Para grupos:</strong> ingresa la cantidad de personas libremente y el monto total manualmente (no requiere número de hospedaje)</li>
                <li>Una vez completado, haz clic en "Crear Reserva"</li>
            </ul>
        </div>
    );
};

export default InfoPanel;
