import { useState, useEffect } from 'react';

/**
 * Hook para manejar el estado y lógica del formulario de reserva rápida
 */
export const useReservaRapidaForm = () => {
    const [formData, setFormData] = useState({
        // Datos del cliente
        nombre: '',
        apellido: '',
        documento: '',
        telefono: '',
        modelo_vehiculo: '',
        patente: '',
        
        // Datos de la reserva
        fecha_entrada: '',
        fecha_salida: '',
        tipo_hospedaje: '',
        numero_hospedaje: '',
        cantidad_personas: 1,
        monto_total: '',
        observaciones: '',
        estado: 'activa',
        metodo_pago: 'efectivo',
        descuento: 0,
        tipo_descuento: '', // 'monto' o 'porcentaje'
        valor_descuento: '' // valor del descuento
    });

    const [cantidadAdultos, setCantidadAdultos] = useState('0');
    const [cantidadMenores, setCantidadMenores] = useState('0');
    const [cantidadNoches, setCantidadNoches] = useState(null);

    // Calcular noches cuando cambien las fechas
    useEffect(() => {
        if (!formData.fecha_entrada || !formData.fecha_salida) {
            setCantidadNoches(null);
            return;
        }

        // Validar formato de fecha
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(formData.fecha_entrada) || !regex.test(formData.fecha_salida)) {
            setCantidadNoches(null);
            return;
        }

        const fechaEntradaObj = new Date(formData.fecha_entrada);
        const fechaSalidaObj = new Date(formData.fecha_salida);

        // Verificar que sean fechas válidas
        if (isNaN(fechaEntradaObj.getTime()) || isNaN(fechaSalidaObj.getTime())) {
            setCantidadNoches(null);
            return;
        }

        // Verificar que la fecha de salida sea posterior a la de entrada
        if (fechaSalidaObj <= fechaEntradaObj) {
            setCantidadNoches(null);
            return;
        }

        // Calcular la diferencia en milisegundos
        const diffTime = fechaSalidaObj - fechaEntradaObj;
        // Convertir a días (noches)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        setCantidadNoches(diffDays);
    }, [formData.fecha_entrada, formData.fecha_salida]);

    const limpiarFormulario = () => {
        setFormData({
            nombre: '',
            apellido: '',
            documento: '',
            telefono: '',
            modelo_vehiculo: '',
            patente: '',
            fecha_entrada: '',
            fecha_salida: '',
            tipo_hospedaje: '',
            numero_hospedaje: '',
            cantidad_personas: 1,
            monto_total: '',
            observaciones: '',
            estado: 'activa',
            metodo_pago: 'efectivo',
            descuento: 0,
            tipo_descuento: '',
            valor_descuento: ''
        });
        setCantidadAdultos('0');
        setCantidadMenores('0');
        setCantidadNoches(null);
    };

    const handleCantidadAdultosChange = (e) => {
        const value = e.target.value;
        setCantidadAdultos(value);
        
        // Actualizar la cantidad total de personas
        const adultos = parseInt(value) || 0;
        const menores = parseInt(cantidadMenores) || 0;
        const totalPersonas = adultos + menores;
        setFormData(prev => ({
            ...prev,
            cantidad_personas: totalPersonas
        }));
        
        return { adultos: parseInt(value) || 0, menores: parseInt(cantidadMenores) || 0 };
    };

    const handleCantidadMenoresChange = (e) => {
        const value = e.target.value;
        setCantidadMenores(value);
        
        // Actualizar la cantidad total de personas
        const adultos = parseInt(cantidadAdultos) || 0;
        const menores = parseInt(value) || 0;
        const totalPersonas = adultos + menores;
        setFormData(prev => ({
            ...prev,
            cantidad_personas: totalPersonas
        }));
        
        return { adultos: parseInt(cantidadAdultos) || 0, menores: parseInt(value) || 0 };
    };

    return {
        formData,
        setFormData,
        cantidadAdultos,
        cantidadMenores,
        cantidadNoches,
        limpiarFormulario,
        handleCantidadAdultosChange,
        handleCantidadMenoresChange
    };
};

