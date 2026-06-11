import { Mail, MessageCircle, Share2 } from 'lucide-react';
import { businessConfig, whatsappUrl } from '../../config/business';

export function Footer() {
  return (
    <footer className="footer footer-premium">
      <div className="footer-brand-block">
        <strong>{businessConfig.name}</strong>
        <p>{businessConfig.tagline}</p>
        <p>{businessConfig.address}</p>
        <div className="footer-socials">
          <a href={whatsappUrl('Hola, quiero consultar disponibilidad de un espacio profesional.')} target="_blank" rel="noreferrer" aria-label="WhatsApp">
            <MessageCircle size={16} />
          </a>
          <a href={`mailto:${businessConfig.email}`} aria-label="Email"><Mail size={16} /></a>
          <button type="button" aria-label="Compartir"><Share2 size={16} /></button>
        </div>
      </div>

      <div className="footer-columns">
        <div>
          <span>Explorar</span>
          <a href="#espacios">Oficinas</a>
          <a href="#calendario">Disponibilidad</a>
        </div>
        <div>
          <span>Contacto</span>
          <a href={whatsappUrl('Hola, quiero consultar disponibilidad de un espacio profesional.')} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={`mailto:${businessConfig.email}`}>Email</a>
        </div>
      </div>
    </footer>
  );
}
