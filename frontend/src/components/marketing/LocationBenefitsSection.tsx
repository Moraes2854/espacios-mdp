import { ExternalLink, MapPin, ShieldCheck, Snowflake, Sparkles, Wifi } from 'lucide-react';
import { businessConfig } from '../../config/business';

const benefits = [
  { icon: Wifi, title: 'Fibra óptica', text: 'Conexión estable para videollamadas y trabajo profesional.' },
  { icon: Sparkles, title: 'Limpieza', text: 'Espacios preparados para recibir clientes y pacientes.' },
  { icon: Snowflake, title: 'Climatización', text: 'Ambiente cómodo durante todo el año.' },
  { icon: ShieldCheck, title: 'Seguridad', text: 'Acceso controlado y operación digitalizable.' },
];

const MAP_EMBED_URL = 'https://www.google.com/maps?q=Rivadavia%203174%2C%20Mar%20del%20Plata%2C%20Buenos%20Aires&z=16&output=embed';

export function LocationBenefitsSection() {
  return (
    <section className="section location-section-premium">
      <div className="location-map-card location-map-card-real" aria-label="Ubicación en Google Maps">
        <iframe
          title="Rivadavia 3174, Mar del Plata"
          src={MAP_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a className="map-open-link" href={businessConfig.googleMapsUrl} target="_blank" rel="noreferrer">
          <MapPin size={18} /> Abrir en Google Maps <ExternalLink size={15} />
        </a>
      </div>

      <div className="location-copy">
        <span className="eyebrow">Ubicación y servicios</span>
        <h2>Ubicación estratégica y servicios incluidos</h2>
        <p>
          Estamos en una zona céntrica de Mar del Plata, con espacios pensados para atender, reunirse o trabajar con privacidad y buena presencia.
        </p>
        <div className="benefit-grid">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title}>
                <span><Icon size={18} /></span>
                <div>
                  <strong>{benefit.title}</strong>
                  <p>{benefit.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
