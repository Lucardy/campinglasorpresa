import React from 'react';
import { FaSwimmingPool, FaWifi, FaUtensils, FaShower, FaParking, FaStore, FaFire, FaLeaf, FaWater, FaBolt, FaBed, FaTv, FaFan, FaCheckCircle, FaChild, FaFutbol, FaDumbbell, FaMountain, FaPlug, FaTableTennis, FaCampground, FaLightbulb, FaDog, FaCar } from 'react-icons/fa';
import './Services.css';

const Services = () => {
  const services = [
    {
      category: "Alojamiento",
      icon: <FaBed />,
      items: [
        "Cabañas con capacidad para 4-5 personas",
        "Dormis con cama de dos plazas y cama superpuesta",
        "72 Parcelas para camping",
        "Ropa Blanca y de Cama en cabañas",
        "Vajilla completa en cabañas",
        "Baño individual en cabañas",
        "Televisor con Cable en cabañas",
        "Ventilador de techo en cabañas y dormis",
        "Placar y Tendedero en cabañas",
        "Estacionamiento cubierto en cabañas",
        "Aceptamos mascotas pequeñas en cabañas"
      ]
    },
    {
      category: "Piscinas y Recreación",
      icon: <FaSwimmingPool />,
      items: [
        "3 Piscinas en total",
        "Piscina recreativa: 15m x 8m (prof. 1.70m)",
        "Piscina pasiva: 12m x 6m (prof. 1.70m)",
        "Piscina infantil: 6m x 3m (prof. 0.65m) con cerco y lava pies",
        "Canchas (Voley, Básquet, Fútbol)",
        "Juegos infantiles (Subí y Baja, Trepadora, Tobogán, Hamacas, Caballo de resorte)",
        "10 máquinas de gimnasia al aire libre",
        "Alquiler de Metegol y Mesa de Ping Pong",
        "Mirador de las Sierras de los Comechingones y el Valle del Conlara",
        "El servicio de pileta se brinda en temporada de verano y Semana Santa"
      ]
    },
    {
      category: "Servicios y Extras",
      icon: <FaWifi />,
      items: [
        "WI-FI en todo el predio",
        "Grupo electrógeno trifásico para todo el predio en caso de corte de luz",
        "Agua propia para casos de corte en la región",
        "Amplio Baño con bidet con agua caliente las 24 hs",
        "Piletas para lava vajilla y lava ropa",
        "Amplio quincho con fogón, mesas y sillas",
        "Proveeduría con comidas rápidas y platos elaborados",
        "Fogones para cada Parcela de camping",
        "Iluminación con toma corriente en cada parcela de camping",
        "Agua en cada parcela de camping",
        "Mesas y banquetas plegables sin cargo para camping",
        "Todos los servicios incluidos en el precio"
      ]
    }
  ];

  return (
    <section className="services-section" id="servicios">
      <div className="services-container">
        <h2>Nuestros Servicios</h2>
        <p className="services-subtitle">Descubrí todo lo que tenemos para ofrecerte</p>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-header">
                <div className="service-icon">
                  {service.icon}
                </div>
                <h3>{service.category}</h3>
              </div>
              <ul className="service-list">
                {service.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <span className="service-item-icon">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 