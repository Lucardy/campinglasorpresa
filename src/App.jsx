import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Admin from './components/Admin/Admin'
import About from './components/About/About'
import Contact from './components/Contact/Contact'
import Services from './components/Services/Services'
import Camping from './pages/Camping'
import Cabanas from './pages/Cabanas'
import Dormis from './pages/Dormis'
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import Preloader from './components/Preloader/Preloader'
import UnikuoDeveloper from './components/Unikuodeveloper/UnikuoDeveloper'
import ProtectedRoute from './components/Admin/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import cacheManager from './utils/cacheManager'
import './App.css'

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  console.log('🔧 AppContent: Componente ejecutado');
  console.log('🔧 AppContent: location.pathname:', location.pathname);
  console.log('🔧 AppContent: isAdminRoute:', isAdminRoute);

  return (
      <div className="app">
        <Preloader />
      {!isAdminRoute && <Navbar />}
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <About />
              <Services />
              <Contact />
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/camping" element={<Camping />} />
          <Route path="/cabanas" element={<Cabanas />} />
          <Route path="/dormis" element={<Dormis />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
          path="/admin/*" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      {!isAdminRoute && <WhatsAppButton />}
      {!isAdminRoute && <UnikuoDeveloper />}
        <ScrollToTop />
      </div>
  );
};

function App() {
  useEffect(() => {
    // Gestión automática de cache
    const gestionarCache = () => {
      try {
        // Mostrar información del cache
        const info = cacheManager.getInfo();
        console.log('📊 Información del cache:', info);
        
        // Limpiar cache solo si es necesario
        const seLimpio = cacheManager.limpiarCacheSiNecesario();
        
        if (seLimpio) {
          console.log('🔄 Cache actualizado, la aplicación se cargará con datos frescos');
        } else {
          console.log('✅ Cache actualizado, continuando normalmente');
        }
      } catch (error) {
        console.log('⚠️ Error en gestión de cache:', error);
        // En caso de error, limpiar por seguridad
        cacheManager.forzarLimpieza();
      }
    };

    // Ejecutar gestión de cache
    gestionarCache();
    
    // Inicializar AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
    </Router>
    </AuthProvider>
  );
}

export default App;
