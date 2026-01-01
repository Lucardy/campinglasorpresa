import { useState, useEffect } from 'react'
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
import ProtectedRoute from './components/Admin/ProtectedRoute'
import './App.css'

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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
      <ScrollToTop />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
