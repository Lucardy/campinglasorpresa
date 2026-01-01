import Gallery from '../components/Gallery/Gallery';
import { FaSwimmingPool, FaDog, FaCar, FaWifi, FaFire, FaUtensils, FaFutbol, FaChild, FaDumbbell, FaMountain, FaPlug, FaBed, FaTv, FaFan, FaCheckCircle, FaTableTennis } from 'react-icons/fa';
import img21 from '../assets/cabañas/21.jpg';
import img22 from '../assets/cabañas/22.jpg';
import img23 from '../assets/cabañas/23.jpg';
import img24 from '../assets/cabañas/24.jpg';
import img25 from '../assets/cabañas/25.jpg';
import img29 from '../assets/cabañas/29.jpg';
import img41 from '../assets/cabañas/DSC00041.jpg';
import './Cabanas.css';

const images = [
  img21,
  img22,
  img23,
  img24,
  img25,
  img29,
  img41,
];

const Cabanas = () => {
  return (
    <section className="section-page cabanas-page">
      <h2 className="cabanas-title">Nuestras Cabañas</h2>
      <div className="cabanas-container">
        <div className="cabanas-grid">
          <div className="cabanas-card">
            <div className="card-header">
              <FaBed className="card-icon" />
              <h3>Capacidad y Comodidades</h3>
            </div>
            <div className="card-content">
              <ul className="servicios-lista">
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Capacidad para 4 o 5 personas</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Ropa Blanca y de Cama</span>
                </li>
                <li className="servicio-item">
                  <FaUtensils className="icono-servicio" />
                  <span>Vajilla completa</span>
                </li>
                <li className="servicio-item">
                  <FaFire className="icono-servicio" />
                  <span>Fogones</span>
                </li>
                <li className="servicio-item">
                  <FaBed className="icono-servicio" />
                  <span>Baño individual</span>
                </li>
                <li className="servicio-item">
                  <FaTv className="icono-servicio" />
                  <span>Televisor con Cable</span>
                </li>
                <li className="servicio-item">
                  <FaFan className="icono-servicio" />
                  <span>Ventilador de techo</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Placar y Tendedero</span>
                </li>
                <li className="servicio-item">
                  <FaCar className="icono-servicio" />
                  <span>Estacionamiento cubierto</span>
                </li>
                <li className="servicio-item">
                  <FaDog className="icono-servicio" />
                  <span>Aceptamos mascotas pequeñas (no se permite que suban a las camas)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="cabanas-card">
            <div className="card-header">
              <FaSwimmingPool className="card-icon" />
              <h3>Piscinas y Recreación</h3>
            </div>
            <div className="card-content">
              <ul className="servicios-lista">
                <li className="servicio-item">
                  <FaSwimmingPool className="icono-servicio" />
                  <span>3 Piscinas en total</span>
                </li>
                <li className="servicio-item">
                  <FaSwimmingPool className="icono-servicio" />
                  <span>Piscina recreativa: 15m x 8m (prof. 1.70m)</span>
                </li>
                <li className="servicio-item">
                  <FaSwimmingPool className="icono-servicio" />
                  <span>Piscina pasiva: 12m x 6m (prof. 1.70m)</span>
                </li>
                <li className="servicio-item">
                  <FaChild className="icono-servicio" />
                  <span>Piscina infantil: 6m x 3m (prof. 0.65m) con cerco y lava pies</span>
                </li>
                <li className="servicio-item">
                  <FaFutbol className="icono-servicio" />
                  <span>Canchas (Voley, Básquet, Fútbol)</span>
                </li>
                <li className="servicio-item">
                  <FaChild className="icono-servicio" />
                  <span>Juegos infantiles (Subí y Baja, Trepadora, Tobogán, Hamacas, Caballo de resorte)</span>
                </li>
                <li className="servicio-item">
                  <FaDumbbell className="icono-servicio" />
                  <span>10 máquinas de gimnasia al aire libre</span>
                </li>
                <li className="servicio-item">
                  <FaTableTennis className="icono-servicio" />
                  <span>Alquiler de Metegol y Mesa de Ping Pong</span>
                </li>
                <li className="servicio-item">
                  <FaMountain className="icono-servicio" />
                  <span>Mirador de las Sierras de los Comechingones y el Valle del Conlara</span>
                </li>
                <li className="servicio-item highlight">
                  <FaSwimmingPool className="icono-servicio" />
                  <span>El servicio de pileta se brinda en temporada de verano y Semana Santa</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="cabanas-card">
            <div className="card-header">
              <FaWifi className="card-icon" />
              <h3>Servicios y Extras</h3>
            </div>
            <div className="card-content">
              <ul className="servicios-lista">
                <li className="servicio-item">
                  <FaWifi className="icono-servicio" />
                  <span>WI-FI en todo el predio</span>
                </li>
                <li className="servicio-item">
                  <FaPlug className="icono-servicio" />
                  <span>Grupo electrógeno trifásico para todo el predio en caso de corte de luz</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Agua propia para casos de corte en la región</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Amplio Baño con bidet con agua caliente las 24 hs</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Piletas para lava vajilla y lava ropa</span>
                </li>
                <li className="servicio-item">
                  <FaFire className="icono-servicio" />
                  <span>Amplio quincho con fogón, mesas y sillas</span>
                </li>
                <li className="servicio-item">
                  <FaUtensils className="icono-servicio" />
                  <span>Proveeduría con comidas rápidas y platos elaborados</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Todos los servicios incluidos en el precio</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Gallery images={images} />
    </section>
  );
};

export default Cabanas; 