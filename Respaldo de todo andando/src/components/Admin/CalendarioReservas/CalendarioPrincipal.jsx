import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import './CalendarioReservas.css';

const CalendarioPrincipal = ({ 
    events, 
    onEventClick, 
    renderEventContent,
    getColorForTipo 
}) => {
    return (
        <div className="calendario-wrapper">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={esLocale}
                events={events}
                eventClick={onEventClick}
                eventContent={renderEventContent}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                }}
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana'
                }}
                height="auto"
                eventMaxStack={3}
                eventMinHeight={20}
            />
        </div>
    );
};

export default CalendarioPrincipal; 