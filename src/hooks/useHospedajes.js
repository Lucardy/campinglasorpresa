import { useState, useCallback } from 'react';
import config from '../config';
import { notify } from '../components/Admin/Notifications/NotificationSystem';

/**
 * Hook compartido para manejar todas las operaciones relacionadas con hospedajes
 * Elimina duplicación de código entre useReservaRapida, useReservaForm y EditarReservaModal
 */
const useHospedajes = () => {
    const [tiposHospedaje, setTiposHospedaje] = useState([]);
    const [hospedajes, setHospedajes] = useState([]);
    const [hospedajesDisponibles, setHospedajesDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Obtiene la URL de la API según el entorno
     * Maneja localhost vs producción
     */
    const getApiUrl = useCallback((endpoint, params = '') => {
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDev) {
            return `http://localhost/campinglasorpresa/api/endpoints/${endpoint}${params}`;
        } else {
            return `${config.API_URL}/${endpoint}${params}`;
        }
    }, []);

    /**
     * Obtiene todos los tipos de hospedaje
     * @param {Object} options - Opciones adicionales
     * @param {boolean} options.includeHospedajes - Si incluir también la lista de hospedajes
     * @returns {Promise<Array>} Lista de tipos de hospedaje
     */
    const fetchTiposHospedaje = useCallback(async (options = {}) => {
        try {
            setLoading(true);
            setError(null);

            const apiUrl = getApiUrl('hospedajes.php', options.includeHospedajes ? '' : '?tipos');
            
            console.log('🔗 Obteniendo tipos de hospedaje desde:', apiUrl);
            
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
            console.log('📊 Datos recibidos de hospedajes:', data);

            if (data.success) {
                // Ordenar tipos de hospedaje por ID numérico
                const tiposOrdenados = (data.tipos_hospedaje || data.tipos || []).sort((a, b) => parseInt(a.id) - parseInt(b.id));
                setTiposHospedaje(tiposOrdenados);
                
                // Si se solicitan también los hospedajes, guardarlos
                if (options.includeHospedajes && data.hospedajes) {
                    setHospedajes(data.hospedajes);
                }
                
                console.log('✅ Tipos de hospedaje cargados:', tiposOrdenados?.length || 0);
                return tiposOrdenados;
            } else {
                throw new Error(data.error || data.message || 'Error al cargar tipos de hospedaje');
            }
        } catch (error) {
            console.error('❌ Error al cargar tipos de hospedaje:', error);
            setError(error.message);
            notify.error(`Error al cargar tipos de hospedaje: ${error.message}`);
            return [];
        } finally {
            setLoading(false);
        }
    }, [getApiUrl]);

    /**
     * Obtiene hospedajes disponibles para un tipo y rango de fechas
     * @param {string|number} tipoHospedajeId - ID del tipo de hospedaje
     * @param {string} fechaEntrada - Fecha de entrada (YYYY-MM-DD)
     * @param {string} fechaSalida - Fecha de salida (YYYY-MM-DD)
     * @param {Object} options - Opciones adicionales
     * @param {boolean} options.useDisponibilidadEndpoint - Usar endpoint con disponibilidad=1 (default: true)
     * @param {number|null} options.includeHospedajeId - ID de hospedaje a incluir aunque no esté disponible
     * @returns {Promise<Array>} Lista de hospedajes disponibles
     */
    const fetchHospedajesDisponibles = useCallback(async (tipoHospedajeId, fechaEntrada, fechaSalida, options = {}) => {
        try {
            setLoading(true);
            setError(null);

            if (!tipoHospedajeId) {
                setHospedajesDisponibles([]);
                return [];
            }

            if (!fechaEntrada || !fechaSalida) {
                setHospedajesDisponibles([]);
                return [];
            }

            const useDisponibilidad = options.useDisponibilidadEndpoint !== false; // default true
            let url;
            
            if (useDisponibilidad) {
                // Endpoint con disponibilidad=1 (usado por ReservaRapida y EditarReservaModal)
                url = getApiUrl('hospedajes.php', `?disponibilidad=1&tipo_hospedaje_id=${tipoHospedajeId}&fecha_entrada=${fechaEntrada}&fecha_salida=${fechaSalida}`);
            } else {
                // Endpoint sin disponibilidad=1 (usado por useReservaForm)
                url = getApiUrl('hospedajes.php', `?tipo_hospedaje_id=${tipoHospedajeId}&fecha_entrada=${fechaEntrada}&fecha_salida=${fechaSalida}`);
            }

            console.log('🔗 Obteniendo hospedajes disponibles desde:', url);
            console.log('📋 Parámetros:', { tipoHospedajeId, fechaEntrada, fechaSalida });

            const response = await fetch(url, {
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
            console.log('📊 Hospedajes disponibles recibidos:', data);

            if (!data.success) {
                const errorMessage = data.details || data.error || data.message || 'Error al cargar hospedajes';
                console.error('❌ Error del servidor:', errorMessage);
                throw new Error(errorMessage);
            }

            // Ordenar hospedajes por número
            let hospedajesDisponibles = (data.hospedajes || []).sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

            // Si se especifica un hospedajeId a incluir y no está en la lista, agregarlo
            if (options.includeHospedajeId && !hospedajesDisponibles.find(h => h.id === options.includeHospedajeId)) {
                try {
                    const hospedaje = await getHospedajeById(options.includeHospedajeId);
                    if (hospedaje) {
                        hospedajesDisponibles.push(hospedaje);
                        hospedajesDisponibles.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
                    }
                } catch (error) {
                    console.error('Error al obtener hospedaje a incluir:', error);
                }
            }

            setHospedajesDisponibles(hospedajesDisponibles);
            console.log('✅ Hospedajes disponibles actualizados:', hospedajesDisponibles?.length || 0);
            return hospedajesDisponibles;
        } catch (error) {
            console.error('❌ Error al cargar hospedajes disponibles:', error);
            setError(error.message);
            notify.error(error.message || 'Error al cargar hospedajes disponibles');
            setHospedajesDisponibles([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [getApiUrl]);

    /**
     * Obtiene un hospedaje específico por su ID
     * @param {number|string} hospedajeId - ID del hospedaje
     * @returns {Promise<Object|null>} Hospedaje encontrado o null
     */
    const getHospedajeById = useCallback(async (hospedajeId) => {
        try {
            setLoading(true);
            setError(null);

            const url = getApiUrl('hospedajes.php', `?id=${hospedajeId}`);
            
            console.log('🔗 Obteniendo hospedaje ID:', hospedajeId);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar hospedaje');
            }

            const data = await response.json();
            
            if (data.success && data.hospedaje) {
                console.log('✅ Hospedaje obtenido:', data.hospedaje);
                return data.hospedaje;
            } else {
                throw new Error(data.message || 'Hospedaje no encontrado');
            }
        } catch (error) {
            console.error('❌ Error al obtener hospedaje:', error);
            setError(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getApiUrl]);

    /**
     * Obtiene el tipo de hospedaje de un hospedaje específico
     * @param {number|string} hospedajeId - ID del hospedaje
     * @returns {Promise<Object|null>} Tipo de hospedaje encontrado o null
     */
    const getTipoHospedajeDelHospedaje = useCallback(async (hospedajeId) => {
        try {
            const hospedaje = await getHospedajeById(hospedajeId);
            if (!hospedaje || !hospedaje.tipo_hospedaje_id) {
                return null;
            }

            // Buscar el tipo en los tipos ya cargados
            const tipo = tiposHospedaje.find(t => t.id === hospedaje.tipo_hospedaje_id);
            if (tipo) {
                return tipo;
            }

            // Si no está cargado, cargar tipos y buscar
            const tipos = await fetchTiposHospedaje();
            return tipos.find(t => t.id === hospedaje.tipo_hospedaje_id) || null;
        } catch (error) {
            console.error('❌ Error al obtener tipo de hospedaje:', error);
            return null;
        }
    }, [getHospedajeById, tiposHospedaje, fetchTiposHospedaje]);

    /**
     * Limpia todos los estados
     */
    const reset = useCallback(() => {
        setTiposHospedaje([]);
        setHospedajes([]);
        setHospedajesDisponibles([]);
        setError(null);
    }, []);

    return {
        // Estados
        tiposHospedaje,
        hospedajes,
        hospedajesDisponibles,
        loading,
        error,
        
        // Métodos
        fetchTiposHospedaje,
        fetchHospedajesDisponibles,
        getHospedajeById,
        getTipoHospedajeDelHospedaje,
        reset,
        
        // Setters (para casos especiales donde se necesite setear manualmente)
        setTiposHospedaje,
        setHospedajes,
        setHospedajesDisponibles
    };
};

export default useHospedajes;

