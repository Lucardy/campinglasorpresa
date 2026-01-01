import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  console.log('🔧 ProtectedRoute: Componente ejecutado');
  console.log('🔧 ProtectedRoute: URL actual:', window.location.href);
  console.log('🔧 ProtectedRoute: Pathname:', window.location.pathname);
  
  const { isAuthenticated, isInitialized } = useAuth();
  
  console.log('🔧 ProtectedRoute: isAuthenticated:', isAuthenticated);
  console.log('🔧 ProtectedRoute: isInitialized:', isInitialized);
  console.log('🔧 ProtectedRoute: localStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));

  // Esperar a que se inicialice el contexto antes de tomar decisiones
  if (!isInitialized) {
    console.log('🔧 ProtectedRoute: Contexto no inicializado, esperando...');
    return <div>Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    console.log('🔧 ProtectedRoute: Usuario NO autenticado, redirigiendo a /');
    return <Navigate to="/" replace />;
  }

  console.log('🔧 ProtectedRoute: Usuario autenticado, renderizando Admin...');
  return children;
};

export default ProtectedRoute; 