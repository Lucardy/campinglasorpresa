import Gallery from '../components/Gallery/Gallery';
import { FaSwimmingPool, FaChild, FaWifi, FaFire, FaUtensils, FaFutbol, FaDumbbell, FaMountain, FaPlug, FaCampground, FaFan, FaCheckCircle, FaTableTennis, FaLightbulb, FaWater, FaPlay } from 'react-icons/fa';
import img1 from '../assets/camping/20160207_1855351.jpg';
import img2 from '../assets/camping/dormisnueva.jpg';
import img3 from '../assets/camping/12494799_930646473690411_513020070871960617_n1.jpg';
import img4 from '../assets/camping/1.jpg';
import img5 from '../assets/camping/DSC00033.jpg';
import img6 from '../assets/camping/DSC00021.jpg';
import img7 from '../assets/camping/DSC00013.jpg';
import img8 from '../assets/camping/DSC00006.jpg';
import img9 from '../assets/camping/1-IMAGEN-170.jpg';
import img10 from '../assets/camping/1-IMAGEN-169.jpg';
import img11 from '../assets/camping/P2050121.jpg';
import img12 from '../assets/camping/P2030015.jpg';
import img13 from '../assets/camping/P2030011.jpg';
import img14 from '../assets/camping/P2030008.jpg';
import img15 from '../assets/camping/P2030005.jpg';
import img16 from '../assets/camping/P20300011.jpg';
import img17 from '../assets/camping/DSC00297.jpg';
import img18 from '../assets/camping/DSC00134.jpg';
import img19 from '../assets/camping/DSC00123.jpg';
import img20 from '../assets/camping/DSC00110.jpg';
import img21 from '../assets/camping/DSC00099.jpg';
import img22 from '../assets/camping/DSC00096.jpg';
import img23 from '../assets/camping/DSC00094.jpg';
import img24 from '../assets/camping/DSC00064.jpg';
import img25 from '../assets/camping/DSC00056.jpg';
import img26 from '../assets/camping/DSC000531.jpg';
import img27 from '../assets/camping/DSC00051.jpg';
import img28 from '../assets/camping/DSC000441.jpg';
import img29 from '../assets/camping/DSC00042.jpg';
import img30 from '../assets/camping/DSC00041.jpg';
import img31 from '../assets/camping/DSC00040.jpg';
import img32 from '../assets/camping/DSC00038.jpg';
import img33 from '../assets/camping/100_5787.jpg';
import img34 from '../assets/camping/100_5785.jpg';
import img35 from '../assets/camping/100_5783.jpg';
import img36 from '../assets/camping/100_5746.jpg';
import img37 from '../assets/camping/100_5743.jpg';
import img38 from '../assets/camping/varias-de-kevin-y-nuestras-225.jpg';
import img39 from '../assets/camping/12434358_971111629603632_1500577198_n.jpg';
import img40 from '../assets/camping/100_5798.jpg';
import videoCamping from '../assets/videos/videocamping.mp4';
import './Camping.css';

const images = [
  img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15, img16, img17, img18, img19, img20,
  img21, img22, img23, img24, img25, img26, img27, img28, img29, img30,
  img31, img32, img33, img34, img35, img36, img37, img38, img39, img40
];

const Camping = () => {
  return (
    <section className="section-page camping-page">
      <h2 className="camping-title">Nuestro Camping</h2>
      
      {/* Sección de Video */}
      <div className="video-section">
        <div className="video-container">
          <h3 className="video-title">
            <FaPlay className="video-icon" />
            Conoce Nuestro Camping
          </h3>
          <div className="video-wrapper">
            <video 
              className="camping-video" 
              controls 
              preload="metadata"
              poster={img1}
            >
              <source src={videoCamping} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
          <p className="video-description">
            Explora nuestras amplias parcelas y disfruta de la naturaleza 
            en su máxima expresión con todas las comodidades que necesitas.
          </p>
        </div>
      </div>

      <div className="camping-container">
        <div className="camping-grid">
          <div className="camping-card">
            <div className="card-header">
              <FaCampground className="card-icon" />
              <h3>Capacidad y Comodidades</h3>
            </div>
            <div className="card-content">
              <ul className="servicios-lista">
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>72 Parcelas</span>
                </li>
                <li className="servicio-item">
                  <FaFire className="icono-servicio" />
                  <span>Fogones para cada Parcela</span>
                </li>
                <li className="servicio-item">
                  <FaLightbulb className="icono-servicio" />
                  <span>Iluminación con toma corriente en cada parcela</span>
                </li>
                <li className="servicio-item">
                  <FaWater className="icono-servicio" />
                  <span>Agua en cada parcela</span>
                </li>
                <li className="servicio-item">
                  <FaCheckCircle className="icono-servicio" />
                  <span>Mesas y banquetas plegables sin cargo</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="camping-card">
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

          <div className="camping-card">
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

export default Camping; 