import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    console.log('🔧 AuthProvider: Inicializando...');
    
    // Leer el estado inicial del localStorage de manera síncrona
    const initialAuthState = localStorage.getItem('isAuthenticated') === 'true';
    console.log('🔧 AuthProvider: Estado inicial del localStorage:', initialAuthState);
    
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);
    const [isInitialized, setIsInitialized] = useState(false);
    
    console.log('🔧 AuthProvider: isAuthenticated inicial:', isAuthenticated);
    console.log('🔧 AuthProvider: isInitialized:', isInitialized);

    // Efecto para inicializar el estado
    useEffect(() => {
        console.log('🔧 AuthProvider: useEffect de inicialización ejecutado');
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        console.log('🔧 AuthProvider: useEffect de sincronización ejecutado, isAuthenticated:', isAuthenticated);
        // Sincronizar el estado con localStorage
        if (isAuthenticated) {
            localStorage.setItem('isAuthenticated', 'true');
            console.log('🔧 AuthProvider: Guardando autenticación en localStorage');
        } else {
            localStorage.removeItem('isAuthenticated');
            console.log('🔧 AuthProvider: Removiendo autenticación de localStorage');
        }
    }, [isAuthenticated]);

    const login = () => {
        console.log('🔧 AuthProvider: Función login ejecutada');
        setIsAuthenticated(true);
    };

    const logout = () => {
        console.log('🔧 AuthProvider: Función logout ejecutada');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isInitialized, 
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}; 