import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';
import './index.css'
import App from './App.jsx'

// Registrar el locale español de manera global al inicio de la aplicación
try {
    registerLocale('es', es);
    console.log('Locale español registrado correctamente');
} catch (error) {
    console.warn('Error al registrar locale español:', error);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
