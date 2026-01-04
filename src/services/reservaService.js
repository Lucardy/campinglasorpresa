import config from '../config';
import { notify } from '../components/Admin/Notifications/NotificationSystem';

/**
 * Servicio centralizado para todas las operaciones de API relacionadas con reservas
 * Elimina duplicación de código y proporciona un punto único de manejo de errores
 */
class ReservaService {
    /**
     * Construye la URL completa de la API
     * @param {string} endpoint - Endpoint de la API (ej: 'reservas.php')
     * @param {Object} params - Parámetros de consulta
     * @returns {string} URL completa
     */
    buildUrl(endpoint, params = {}) {
        const url = new URL(`${config.API_URL}/${endpoint}`);
        
        // Agregar timestamp para evitar cache
        params._t = new Date().getTime();
        
        // Agregar todos los parámetros a la URL
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        return url.toString();
    }

    /**
     * Realiza una petición HTTP con manejo de errores centralizado
     * @param {string} url - URL completa
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Object>} Datos de la respuesta
     */
    async request(url, options = {}) {
        const defaultHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            // Verificar Content-Type antes de parsear JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('❌ La respuesta no es JSON. Content-Type:', contentType);
                console.error('❌ Respuesta recibida:', textResponse.substring(0, 500));
                throw new Error(`El servidor devolvió un error. Verifica la URL de la API: ${config.API_URL}`);
            }

            if (!response.ok) {
                let errorMessage = `Error HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage = errorText.substring(0, 200) || errorMessage;
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error en petición a:', url);
            console.error('❌ Error:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las reservas
     * @param {Object} filtros - Filtros opcionales (no implementados aún en backend)
     * @returns {Promise<Array>} Lista de reservas
     */
    async fetchReservas(filtros = {}) {
        try {
            console.log('🔄 ReservaService: Obteniendo reservas...');
            const url = this.buildUrl('reservas.php', filtros);
            const data = await this.request(url);
            
            if (!Array.isArray(data)) {
                console.error('❌ La respuesta no es un array:', data);
                throw new Error('Error en el formato de los datos');
            }

            console.log('✅ ReservaService: Reservas obtenidas:', data.length);
            return data;
        } catch (error) {
            console.error('❌ Error al cargar reservas:', error);
            throw error;
        }
    }

    /**
     * Obtiene una reserva por su ID
     * @param {number|string} id - ID de la reserva
     * @returns {Promise<Object>} Reserva encontrada
     */
    async getReservaById(id) {
        try {
            console.log('🔄 ReservaService: Obteniendo reserva ID:', id);
            const url = this.buildUrl('reservas.php', { id });
            const data = await this.request(url);
            
            if (data.success && data.reserva) {
                return data.reserva;
            } else if (data.success && data.id) {
                // Algunos endpoints devuelven la reserva directamente
                return data;
            } else {
                throw new Error(data.message || 'Reserva no encontrada');
            }
        } catch (error) {
            console.error('❌ Error al obtener reserva:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva reserva
     * @param {Object} reservaData - Datos de la reserva
     * @returns {Promise<Object>} Reserva creada con su ID
     */
    async createReserva(reservaData) {
        try {
            console.log('🔄 ReservaService: Creando reserva...');
            console.log('📝 Datos:', reservaData);
            
            const url = this.buildUrl('reservas.php');
            const data = await this.request(url, {
                method: 'POST',
                body: JSON.stringify(reservaData)
            });

            if (data.success && data.id) {
                console.log('✅ ReservaService: Reserva creada exitosamente, ID:', data.id);
                return data;
            } else {
                throw new Error(data.message || 'Error al crear la reserva');
            }
        } catch (error) {
            console.error('❌ Error al crear reserva:', error);
            throw error;
        }
    }

    /**
     * Actualiza una reserva existente
     * @param {number|string} id - ID de la reserva
     * @param {Object} reservaData - Datos a actualizar
     * @returns {Promise<Object>} Respuesta de la actualización
     */
    async updateReserva(id, reservaData) {
        try {
            console.log('🔄 ReservaService: Actualizando reserva ID:', id);
            console.log('📝 Datos:', reservaData);
            
            const url = this.buildUrl('reservas.php');
            const data = await this.request(url, {
                method: 'PUT',
                body: JSON.stringify({
                    id,
                    ...reservaData
                })
            });

            if (data.success !== false) {
                console.log('✅ ReservaService: Reserva actualizada exitosamente');
                return data;
            } else {
                throw new Error(data.message || 'Error al actualizar la reserva');
            }
        } catch (error) {
            console.error('❌ Error al actualizar reserva:', error);
            throw error;
        }
    }

    /**
     * Elimina una reserva
     * @param {number|string} id - ID de la reserva
     * @returns {Promise<boolean>} true si se eliminó correctamente
     */
    async deleteReserva(id) {
        try {
            console.log('🔄 ReservaService: Eliminando reserva ID:', id);
            
            const url = this.buildUrl('reservas.php', { id });
            const data = await this.request(url, {
                method: 'DELETE'
            });

            if (data.success !== false) {
                console.log('✅ ReservaService: Reserva eliminada exitosamente');
                return true;
            } else {
                throw new Error(data.message || 'Error al eliminar la reserva');
            }
        } catch (error) {
            console.error('❌ Error al eliminar reserva:', error);
            throw error;
        }
    }

    /**
     * Busca reservas por término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Array>} Lista de reservas encontradas
     */
    async searchReservas(searchTerm) {
        try {
            console.log('🔄 ReservaService: Buscando reservas con término:', searchTerm);
            
            const url = this.buildUrl('reservas.php', { search: searchTerm });
            const data = await this.request(url);

            if (Array.isArray(data)) {
                console.log('✅ ReservaService: Reservas encontradas:', data.length);
                return data;
            } else {
                // Si el backend devuelve un formato diferente, intentar extraer las reservas
                if (data.reservas && Array.isArray(data.reservas)) {
                    return data.reservas;
                }
                return [];
            }
        } catch (error) {
            console.error('❌ Error al buscar reservas:', error);
            // En caso de error, retornar array vacío para no romper la UI
            return [];
        }
    }

    /**
     * Obtiene reservas por ID de cliente
     * @param {number|string} clienteId - ID del cliente
     * @returns {Promise<Array>} Lista de reservas del cliente
     */
    async getReservasByCliente(clienteId) {
        try {
            console.log('🔄 ReservaService: Obteniendo reservas del cliente ID:', clienteId);
            
            const url = this.buildUrl('reservas.php', { cliente_id: clienteId });
            const data = await this.request(url);

            if (Array.isArray(data)) {
                return data;
            } else if (data.reservas && Array.isArray(data.reservas)) {
                return data.reservas;
            } else {
                return [];
            }
        } catch (error) {
            console.error('❌ Error al obtener reservas del cliente:', error);
            return [];
        }
    }

    /**
     * Obtiene reportes de ingresos
     * @param {Object} filtros - Filtros para el reporte (fecha_inicio, fecha_fin, metodo_pago, tipo_hospedaje)
     * @returns {Promise<Object>} Datos del reporte con reportes, estadisticas, reportesPorReserva, estadisticasPorReserva
     */
    async getReportesIngresos(filtros = {}) {
        try {
            console.log('🔄 ReservaService: Obteniendo reportes de ingresos...');
            console.log('📋 Filtros:', filtros);
            
            const params = {
                reportes_ingresos: true,
                ...filtros
            };
            
            const url = this.buildUrl('reservas.php', params);
            const data = await this.request(url);

            if (data.success !== false) {
                console.log('✅ ReservaService: Reportes obtenidos exitosamente');
                return {
                    reportes: data.reportes || [],
                    estadisticas: data.estadisticas || {},
                    reportesPorReserva: data.reportesPorReserva || [],
                    estadisticasPorReserva: data.estadisticasPorReserva || {}
                };
            } else {
                throw new Error(data.message || 'Error al obtener reportes');
            }
        } catch (error) {
            console.error('❌ Error al obtener reportes:', error);
            throw error;
        }
    }

    /**
     * Actualiza el estado de una reserva
     * @param {number|string} id - ID de la reserva
     * @param {string} estado - Nuevo estado ('activa', 'cancelada', 'completada')
     * @returns {Promise<Object>} Respuesta de la actualización
     */
    async updateEstadoReserva(id, estado) {
        try {
            console.log('🔄 ReservaService: Actualizando estado de reserva ID:', id, 'a:', estado);
            
            return await this.updateReserva(id, { estado });
        } catch (error) {
            console.error('❌ Error al actualizar estado de reserva:', error);
            throw error;
        }
    }
}

// Exportar una instancia única del servicio (Singleton)
const reservaService = new ReservaService();
export default reservaService;

