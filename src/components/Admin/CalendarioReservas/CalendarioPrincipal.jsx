import React, { useState } from 'react';
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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="calendario-container">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView={isMobile ? "dayGridMonth" : "dayGridMonth"}
                headerToolbar={{
                    left: isMobile ? 'prev,next' : 'prev,next today',
                    center: 'title',
                    right: isMobile ? 'dayGridMonth' : 'dayGridMonth,dayGridWeek'
                }}
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana'
                }}
                locale={esLocale}
                events={events}
                eventClick={onEventClick}
                eventContent={renderEventContent}
                height="auto"
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
                dayMaxEvents={isMobile ? 2 : 4}
                eventDisplay={isMobile ? "block" : "auto"}
                eventMinHeight={isMobile ? 15 : 20}
                eventShortHeight={isMobile ? 15 : 20}
                eventMaxStack={isMobile ? 2 : 4}
                eventOverlap={false}
                dayMinHeight={isMobile ? 60 : 100}
                handleWindowResize={true}
                stickyHeaderDates={true}
                dayHeaderFormat={isMobile ? { weekday: 'short' } : { weekday: 'long' }}
                eventDidMount={(info) => {
                    const { event } = info;
                    const { monto } = event.extendedProps;
                    
                    if (monto) {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'evento-tooltip';
                        tooltip.innerHTML = `
                            <strong>${event.title}</strong><br>
                            Monto: $${monto}
                        `;
                        info.el.appendChild(tooltip);
                    }
                }}
            />
        </div>
    );
};

export default CalendarioPrincipal; 