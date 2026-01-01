import React, { useState, useEffect, useRef } from 'react';
import config from '../../../config';
import { FiltrosCalendario, TIPOS_ALOJAMIENTO } from './FiltrosCalendario';
import DetalleReserva from './DetalleReserva';
import CalendarioPrincipal from './CalendarioPrincipal';
import EditarReservaModal from '../ReservasList/EditarReservaModal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { notify } from '../Notifications/NotificationSystem';
import { parseLocalDate, formatDateForInput } from '../../../utils/dateUtils';
import './CalendarioReservas.css';

const CalendarioReservas = ({ reservas = [], onRefresh, onDeleteReserva, onUpdateReserva }) => {
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [editingReserva, setEditingReserva] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState(TIPOS_ALOJAMIENTO.CABANA);
    const [refreshPagosKey, setRefreshPagosKey] = useState(0);



    // Log de actualizaciones
    useEffect(() => {
        console.log('📅 CalendarioReservas: Actualizando con', reservas.length, 'reservas');
        console.log('📅 CalendarioReservas: IDs de reservas:', reservas.map(r => r.id));
    }, [reservas]);

    // Evitar reintentos infinitos cuando no hay reservas
    const triedInitialRefreshRef = useRef(false);

    // Efecto para cargar datos una sola vez si no hay reservas y hay función de refresh
    useEffect(() => {
        if (reservas.length === 0 && onRefresh && !triedInitialRefreshRef.current) {
            triedInitialRefreshRef.current = true;
            console.log('📅 CalendarioReservas: No hay reservas, intentando cargar datos (una sola vez)...');
            refreshData();
        }
    }, [reservas.length, onRefresh]);

    // Efecto para limpiar reserva seleccionada si ya no existe o actualizarla si cambió
    useEffect(() => {
        if (selectedReserva) {
            const reservaActualizada = reservas.find(r => r.id === selectedReserva.id);
            if (!reservaActualizada) {
                console.log('📅 CalendarioReservas: Reserva seleccionada ya no existe, limpiando...');
                setSelectedReserva(null);
            } else if (JSON.stringify(reservaActualizada) !== JSON.stringify(selectedReserva)) {
                // Actualizar la reserva seleccionada si cambió
                console.log('📅 CalendarioReservas: Actualizando reserva seleccionada con datos nuevos');
                setSelectedReserva(reservaActualizada);
            }
        }
    }, [reservas, selectedReserva]);

    // Función para refrescar datos si es necesario
    const refreshData = async () => {
        if (onRefresh) {
            setLoading(true);
            await onRefresh();
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
            [TIPOS_ALOJAMIENTO.GRUPOS]: '#9b59b6',
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
            await refreshData();
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
                    {reserva.tipo_hospedaje === 'grupos' 
                        ? `Grupo - ${reserva.cantidad_personas} personas`
                        : `${reserva.tipo_hospedaje} ${reserva.numero_hospedaje}`
                    }
                </div>
            </div>
        );
    };

    const calendarEvents = reservas
        .filter(reserva => {
            if (!reserva || !reserva.tipo_hospedaje) return false;
            const tipo = reserva.tipo_hospedaje?.toLowerCase() || '';
            return tipo === filtroActivo;
        })
        .map(reserva => {
            // Convertir fechas a formato correcto para el calendario
            const fechaEntrada = formatDateForInput(reserva.fecha_entrada);
            
            // Para FullCalendar, la fecha de fin es exclusiva, pero nuestro sistema usa fechas inclusivas
            // Necesitamos agregar un día a la fecha de salida para que se muestre correctamente
            const fechaSalidaObj = parseLocalDate(reserva.fecha_salida);
            if (fechaSalidaObj) {
                fechaSalidaObj.setDate(fechaSalidaObj.getDate() + 1);
            }
            const fechaSalida = formatDateForInput(fechaSalidaObj);
            
            return {
                id: reserva.id,
                title: `${reserva.apellido}, ${reserva.nombre}`,
                start: fechaEntrada,
                end: fechaSalida,
                backgroundColor: getColorForTipo(reserva.tipo_hospedaje),
                borderColor: getColorForTipo(reserva.tipo_hospedaje),
                textColor: '#ffffff',
                extendedProps: {
                    tipo_hospedaje: reserva.tipo_hospedaje
                }
            };
        });

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
            {!loading && !error && reservas.length === 0 && (
                <div className="no-results">No hay reservas para mostrar.</div>
            )}

            <CalendarioPrincipal 
                key={`calendar-${reservas.length}`}
                events={calendarEvents}
                onEventClick={handleEventClick}
                renderEventContent={renderEventContent}
                getColorForTipo={getColorForTipo}
            />

            <DetalleReserva 
                reserva={selectedReserva}
                onCerrar={() => setSelectedReserva(null)}
                onPagoAgregado={() => {
                    setRefreshPagosKey(prev => prev + 1);
                    if (onRefresh) {
                        onRefresh();
                    }
                }}
                onExtender={async (reserva) => {
                    if (!reserva || !onUpdateReserva) return;
                    try {
                        const salida = parseLocalDate(reserva.fecha_salida);
                        if (!salida) throw new Error('Fecha de salida inválida');
                        salida.setDate(salida.getDate() + 1);
                        const nuevaSalida = formatDateForInput(salida);
                        // Calcular precio por día para sumar al total
                        let precioDia = 0;
                        try {
                            // Obtener id de tipo de hospedaje
                            let tipoId = null;
                            const tipoNombre = (reserva.tipo_hospedaje || '').toLowerCase();
                            if (tipoNombre === 'camping' || tipoNombre === 'grupos') {
                                tipoId = 3; // convención existente en backend para camping
                            } else {
                                const respTipos = await fetch(`${config.API_URL}/hospedajes.php?tipos=1`, {
                                    headers: { 'Accept': 'application/json' }
                                });
                                if (respTipos.ok) {
                                    const dataTipos = await respTipos.json();
                                    const lista = Array.isArray(dataTipos.tipos) ? dataTipos.tipos : [];
                                    const encontrado = lista.find(t => (t.nombre || '').toLowerCase() === tipoNombre);
                                    if (encontrado && encontrado.id) tipoId = encontrado.id;
                                }
                            }

                            if (tipoId != null) {
                                const metodo = reserva.metodo_pago || 'efectivo';
                                const personas = reserva.cantidad_personas || 1;
                                const respPrecio = await fetch(`${config.API_URL}/hospedajes.php?precio=1&tipo_hospedaje_id=${encodeURIComponent(tipoId)}&cantidad_personas=${encodeURIComponent(personas)}&metodo_pago=${encodeURIComponent(metodo)}`, {
                                    headers: { 'Accept': 'application/json' }
                                });
                                if (respPrecio.ok) {
                                    const dataPrecio = await respPrecio.json();
                                    if (dataPrecio && dataPrecio.success && typeof dataPrecio.precio === 'number') {
                                        precioDia = dataPrecio.precio;
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn('No se pudo obtener precio por día, se mantendrá el total igual', e);
                        }

                        const nuevoTotal = typeof precioDia === 'number' && precioDia > 0
                            ? (Number(reserva.monto_total) || 0) + precioDia
                            : (Number(reserva.monto_total) || 0);

                        await onUpdateReserva(reserva.id, { fecha_salida: nuevaSalida, monto_total: nuevoTotal });
                        notify.success(precioDia > 0 ? 'Se agregó 1 día y se actualizó el monto' : 'Se agregó 1 día a la reserva');
                        await refreshData();
                        // Mantener abierto el detalle con la info actualizada en el próximo render
                    } catch (e) {
                        console.error(e);
                        notify.error('No se pudo extender la reserva (verifique disponibilidad)');
                    }
                }}
                onEliminar={async (reserva) => {
                    if (!reserva || !onDeleteReserva) return;
                    if (!window.confirm(`¿Eliminar la reserva #${reserva.id}? Esta acción no se puede deshacer.`)) return;
                    try {
                        await onDeleteReserva(reserva.id);
                        notify.success('Reserva eliminada correctamente');
                        await refreshData();
                        setSelectedReserva(null);
                    } catch (e) {
                        console.error(e);
                        notify.error('No se pudo eliminar la reserva');
                    }
                }}
                onEditar={(reserva) => {
                    setEditingReserva(reserva);
                    setIsEditModalOpen(true);
                }}
            />

            {/* Modal de edición de reserva */}
            <EditarReservaModal
                reserva={editingReserva}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingReserva(null);
                }}
                onReservaUpdated={async (reservaId, reservaData) => {
                    if (onUpdateReserva) {
                        await onUpdateReserva(reservaId, reservaData);
                    }
                    // Refrescar datos para ver los cambios inmediatamente
                    await refreshData();
                    // Forzar actualización de ResumenPagos
                    setRefreshPagosKey(prev => prev + 1);
                }}
                onRefresh={async () => {
                    await refreshData();
                }}
                onPagoActualizado={() => {
                    // Forzar actualización de ResumenPagos cuando se actualiza un pago
                    setRefreshPagosKey(prev => prev + 1);
                }}
            />
        </div>
    );
};

export default CalendarioReservas; 