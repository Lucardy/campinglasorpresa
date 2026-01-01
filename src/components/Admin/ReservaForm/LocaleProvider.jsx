import React, { useEffect, useState } from 'react';
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';

const LocaleProvider = ({ children }) => {
    const [localeReady, setLocaleReady] = useState(false);

    useEffect(() => {
        try {
            // Registrar el locale español
            registerLocale('es', es);
            setLocaleReady(true);
        } catch (error) {
            console.warn('Error al registrar locale español:', error);
            setLocaleReady(true); // Continuar de todas formas
        }
    }, []);

    if (!localeReady) {
        return <div>Cargando...</div>;
    }

    return children;
};

export default LocaleProvider; 