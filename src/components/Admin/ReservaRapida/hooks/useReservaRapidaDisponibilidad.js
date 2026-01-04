import { useState } from 'react';
import { toast } from 'react-toastify';
import config from '../../../../config';

/**
 * Hook para manejar la verificación de disponibilidad y cantidades disponibles
 * Recibe las funciones de useHospedajes como parámetros para evitar múltiples instancias
 */
export const useReservaRapidaDisponibilidad = (fetchHospedajesDisponiblesHook, setHospedajesDisponibles) => {
    const [verificandoDisponibilidad, setVerificandoDisponibilidad] = useState(false);
    const [cantidadesDisponibles, setCantidadesDisponibles] = useState([]);

    /**
     * Valida si una fecha tiene formato válido
     */
    const esFechaValida = (fecha) => {
        if (!fecha) return false;
        
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(fecha)) {
            console.warn('⚠️ Formato de fecha inválido:', fecha);
            return false;
        }
        
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
            console.warn('⚠️ Fecha no válida:', fecha);
            return false;
        }
        
        const hoy = new Date();
        const diezAnos = new Date();
        diezAnos.setFullYear(hoy.getFullYear() + 10);
        
        if (fechaObj > diezAnos) {
            console.warn('⚠️ Fecha muy futura:', fecha);
            return false;
        }
        
        return true;
    };

    /**
     * Obtiene cantidades disponibles por defecto según el tipo de hospedaje
     */
    const getCantidadesPorDefecto = (tipoHospedajeId) => {
        switch (parseInt(tipoHospedajeId)) {
            case 1: // Cabaña
                return [2, 3, 4, 5];
            case 2: // Dormis
                return [2, 3, 4];
            case 3: // Camping
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            case 4: // Grupos
                return [10, 15, 20, 25, 30, 35, 40, 45, 50];
            default:
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }
    };

    /**
     * Obtiene las cantidades disponibles para un tipo de hospedaje
     */
    const obtenerCantidadesDisponibles = async (tipoHospedajeId) => {
        try {
            if (!tipoHospedajeId) {
                setCantidadesDisponibles([]);
                return;
            }

            console.log('🔢 Obteniendo cantidades disponibles para tipo:', tipoHospedajeId);
            
            const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocalDev
                ? `http://localhost/campinglasorpresa/api/endpoints/hospedajes.php?cantidades_personas=1&tipo_hospedaje_id=${tipoHospedajeId}`
                : `${config.API_URL}/hospedajes.php?cantidades_personas=1&tipo_hospedaje_id=${tipoHospedajeId}`;
            
            console.log('🔗 Obteniendo cantidades en:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Respuesta no exitosa:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('📊 Cantidades disponibles recibidas:', data);
            
            if (data.success && data.cantidades) {
                setCantidadesDisponibles(data.cantidades);
                console.log('✅ Cantidades disponibles actualizadas:', data.cantidades);
            } else {
                console.error('❌ Error en la respuesta:', data.error || 'Error desconocido');
                setCantidadesDisponibles(getCantidadesPorDefecto(tipoHospedajeId));
            }
        } catch (error) {
            console.error('❌ Error al obtener cantidades disponibles:', error);
            console.error('🔍 Detalles del error:', error.message);
            setCantidadesDisponibles(getCantidadesPorDefecto(tipoHospedajeId));
        }
    };

    /**
     * Verifica la disponibilidad de hospedajes para un tipo y rango de fechas
     */
    const verificarDisponibilidadHospedajes = async (tipoHospedajeId, fechaEntrada, fechaSalida) => {
        try {
            if (!tipoHospedajeId || !fechaEntrada || !fechaSalida) {
                console.warn('⚠️ Parámetros incompletos para verificar disponibilidad');
                return;
            }
            
            if (!esFechaValida(fechaEntrada) || !esFechaValida(fechaSalida)) {
                console.warn('⚠️ Fechas inválidas para verificar disponibilidad:', { fechaEntrada, fechaSalida });
                toast.error('⚠️ Las fechas seleccionadas no son válidas');
                return;
            }
            
            setVerificandoDisponibilidad(true);
            console.log('🔍 Verificando disponibilidad para:', { tipoHospedajeId, fechaEntrada, fechaSalida });
            
            const hospedajes = await fetchHospedajesDisponiblesHook(
                tipoHospedajeId,
                fechaEntrada,
                fechaSalida,
                { useDisponibilidadEndpoint: true }
            );
            
            // Solo mostrar advertencia si no es camping ni grupos (que son ilimitados)
            if (hospedajes && hospedajes.length === 0 && tipoHospedajeId !== '3' && tipoHospedajeId !== '4') {
                toast.warning('⚠️ No hay hospedajes disponibles para las fechas seleccionadas');
            }
        } catch (error) {
            console.error('❌ Error al verificar disponibilidad:', error);
            console.error('🔍 Detalles del error:', error.message);
            toast.error(`Error al verificar disponibilidad: ${error.message}`);
        } finally {
            setVerificandoDisponibilidad(false);
        }
    };

    return {
        verificandoDisponibilidad,
        cantidadesDisponibles,
        setCantidadesDisponibles,
        esFechaValida,
        obtenerCantidadesDisponibles,
        verificarDisponibilidadHospedajes,
        setHospedajesDisponibles
    };
};

