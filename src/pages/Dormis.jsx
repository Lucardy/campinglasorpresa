import Gallery from '../components/Gallery/Gallery';
import { FaSwimmingPool, FaChild, FaWifi, FaFire, FaUtensils, FaFutbol, FaDumbbell, FaMountain, FaPlug, FaBed, FaFan, FaCheckCircle, FaTableTennis, FaPlay } from 'react-icons/fa';
import img1 from '../assets/dormis/12687930_947084995379892_5757786958167787821_n.jpg';
import img2 from '../assets/dormis/12687882_947083652046693_3354865528849151955_n.jpg';
import img3 from '../assets/dormis/12650799_947084835379908_5599433609160910035_n.jpg';
import img4 from '../assets/dormis/12644719_947084945379897_3561991217825438705_n.jpg';
import img5 from '../assets/dormis/100_5787.jpg';
import videoDormis from '../assets/videos/videodormis.mp4';
import './Dormis.css';

const images = [
  img1,
  img2,
  img3,
  img4,
  img5,
];

const Dormis = () => {
  return (
    <section className="section-page dormis-page">
      <h2 className="dormis-title">Nuestros Dormis</h2>
      
      {/* Sección de Video */}
      <div className="video-section">
        <div className="video-container">
          <h3 className="video-title">
            <FaPlay className="video-icon" />
            Conoce Nuestros Dormis
          </h3>
          <div className="video-wrapper">
            <video 
              className="dormis-video" 
              controls 
              preload="metadata"
              poster={img1}
            >
              <source src={videoDormis} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
          <p className="video-description">
            Descubre la comodidad y el ambiente acogedor de nuestros dormis, 
            perfectos para una estadía confortable en el camping.
          </p>
        </div>
      </div>

      <div className="dormis-container">
        <div className="dormis-grid">
          <div className="dormis-card">
            <div className="card-header">
              <FaBed className="card-icon" />
              <h3>Capacidad y Comodidades</h3>
            </div>
            <div className="card-content">
              <ul className="servicios-lista">
                <li className="servicio-item">
                  <FaBed className="icono-servicio" />
                  <span>1 cama de dos plazas y una cama superpuesta</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Piso cerámico</span>
                </li>
                <li className="servicio-item">
                  <FaFan className="icono-servicio" />
                  <span>Ventilador de techo</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Uso de baños e instalaciones del camping</span>
                </li>
                <li className="servicio-item highlight">
                  <FaCheckCircle className="icono-servicio" />
                  <span>No incluye ropa de cama</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="dormis-card">
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

          <div className="dormis-card">
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

export default Dormis; 