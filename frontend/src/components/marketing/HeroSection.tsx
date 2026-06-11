import { ArrowRight, CalendarDays, MessageCircle, ShieldCheck } from 'lucide-react';
import { whatsappUrl } from '../../config/business';
import { Space } from '../../types';

function heroImage(spaces: Space[]) {
  const image = spaces.flatMap((space) => space.images || []).find((item) => item.isCover) || spaces[0]?.images?.[0];
  return image?.url || null;
}

type HeroSectionProps = {
  spaces?: Space[];
};

export function HeroSection({ spaces = [] }: HeroSectionProps) {
  const imageUrl = heroImage(spaces);

  return (
    <section className="hero-section hero-section-premium" id="home">
      <div className="hero-content">
        <span className="trust-pill"><ShieldCheck size={16} /> Disponibilidad real en Mar del Plata</span>
        <h1>Espacios profesionales con <span>calendario</span></h1>
        <p>
          Alquilá oficinas y consultorios privados por hora o módulos. Sin contratos largos, con precio claro y reserva simple.
        </p>
        <div className="hero-actions">
          <a className="primary-button large" href="#calendario">
            <CalendarDays size={18} /> Ver disponibilidad <ArrowRight size={18} />
          </a>
          <a className="ghost-button large" href={whatsappUrl('Hola, quiero consultar disponibilidad de un espacio profesional.')} target="_blank" rel="noreferrer">
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="hero-photo-frame">
          {imageUrl ? <img src={imageUrl} alt="" /> : <div className="hero-photo-placeholder" />}
        </div>
      </div>
    </section>
  );
}
