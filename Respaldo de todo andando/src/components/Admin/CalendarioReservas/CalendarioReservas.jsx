import React, { useState, useEffect } from 'react';
import config from '../../../config';
import { FiltrosCalendario, TIPOS_ALOJAMIENTO } from './FiltrosCalendario';
import DetalleReserva from './DetalleReserva';
import CalendarioPrincipal from './CalendarioPrincipal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { notify } from '../Notifications/NotificationSystem';
import './CalendarioReservas.css';

const CalendarioReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtroActivo, setFiltroActivo] = useState(TIPOS_ALOJAMIENTO.CABANA);

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${config.API_URL}/reservas.php`);
            if (!response.ok) throw new Error('Error al cargar reservas');
            const data = await response.json();
            setReservas(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar las reservas');
            notify.error('Error al cargar las reservas');
        } finally {
            setLoading(false);
        }
    };

    const getColorForTipo = (tipo) => {
        if (!tipo) return '#9b59b6';
        
        const tipoNormalizado = tipo.toLowerCase();
        const colores = {
            [TIPOS_ALOJAMIENTO.CABANA]: '#4a90e2',
            [TIPOS_ALOJAMIENTO.DORMI]: '#50c878',
            [TIPOS_ALOJAMIENTO.CAMPING]: '#f5a623',
            'default': '#9b59b6'
        };
        return colores[tipoNormalizado] || colores.default;
    };

    const handleEventClick = (info) => {
        const reserva = reservas.find(r => r.id === parseInt(info.event.id));
        if (reserva) {
            setSelectedReserva(reserva);
        }
    };

    const handleEstadoChange = async (nuevoEstado) => {
        if (!selectedReserva) return;

        try {
            const response = await fetch(`${config.API_URL}/reservas.php?id=${selectedReserva.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: nuevoEstado
                })
            });

            if (!response.ok) throw new Error('Error al actualizar el estado');
            
            notify.success(`Estado de reserva actualizado a ${nuevoEstado}`);
            fetchReservas();
            setSelectedReserva(null);
        } catch (error) {
            console.error('Error:', error);
            notify.error('Error al actualizar el estado de la reserva');
        }
    };

    const cambiarFiltro = (tipo) => {
        setFiltroActivo(tipo);
        notify.info(`Mostrando reservas de ${tipo === 'todos' ? 'todos los tipos' : tipo}`);
    };

    const renderEventContent = (eventInfo) => {
        const reserva = reservas.find(r => r.id === parseInt(eventInfo.event.id));
        if (!reserva) return null;

        return (
            <div className="fc-event-content">
                <div className="cliente-nombre">
                    {reserva.apellido}, {reserva.nombre}
                </div>
                <div className="alojamiento-tipo">
                    {reserva.tipo_hospedaje} {reserva.numero_hospedaje}
                </div>
            </div>
        );
    };

    const calendarEvents = reservas
        .filter(reserva => {
            if (!reserva || !reserva.tipo_hospedaje) return false;
            const tipo = reserva.tipo_hospedaje.toLowerCase();
            return tipo === filtroActivo;
        })
        .map(reserva => ({
            id: reserva.id,
            title: `${reserva.apellido}, ${reserva.nombre}`,
            start: reserva.fecha_entrada,
            end: reserva.fecha_salida,
            backgroundColor: getColorForTipo(reserva.tipo_hospedaje),
            borderColor: getColorForTipo(reserva.tipo_hospedaje),
            textColor: '#ffffff',
            extendedProps: {
                tipo_hospedaje: reserva.tipo_hospedaje
            }
        }));

    return (
        <div className="calendario-container">
            <div className="calendario-header">
                <h2>Calendario de Reservas</h2>
                <FiltrosCalendario 
                    filtroActivo={filtroActivo}
                    onCambiarFiltro={setFiltroActivo}
                />
            </div>

            {loading && <div className="loading-message">Cargando reservas...</div>}
            {error && <div className="error-message">{error}</div>}

            <CalendarioPrincipal 
                events={calendarEvents}
                onEventClick={handleEventClick}
                renderEventContent={renderEventContent}
                getColorForTipo={getColorForTipo}
            />

            <DetalleReserva 
                reserva={selectedReserva}
                onCerrar={() => setSelectedReserva(null)}
            />
        </div>
    );
};

export default CalendarioReservas; 