import { FormEvent, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { api } from '../../api';
import { whatsappUrl } from '../../config/business';
import { Space } from '../../types';

type LeadCaptureFormProps = {
  spaces: Space[];
};

export function LeadCaptureForm({ spaces }: LeadCaptureFormProps) {
  const firstSpaceId = useMemo(() => spaces[0]?.id || '', [spaces]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [desiredSpaceId, setDesiredSpaceId] = useState(firstSpaceId);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      await api.createLead({ name, phone, message, source: 'WEB', status: 'NEW', desiredSpaceId });
      setStatus('Consulta enviada. Quedó registrada en el panel admin.');
      setName('');
      setPhone('');
      setMessage('');
    } catch {
      setStatus('No se pudo guardar la consulta. Probá por WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section contact-section" id="contacto">
      <div>
        <span className="eyebrow">Consulta rápida</span>
        <h2>¿Querés confirmar un horario?</h2>
        <p>Dejá tus datos. También podés escribir por WhatsApp.</p>
        <a className="ghost-button large" href={whatsappUrl('Hola, quiero consultar disponibilidad de un espacio profesional.')} target="_blank" rel="noreferrer">
          <MessageCircle size={18} /> Abrir WhatsApp
        </a>
      </div>

      <form className="lead-form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" required />
        </label>
        <label>
          Teléfono
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="223..." required />
        </label>
        <label>
          Espacio
          <select value={desiredSpaceId} onChange={(event) => setDesiredSpaceId(event.target.value)}>
            {spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
          </select>
        </label>
        <label>
          Mensaje
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Contame qué horario buscás" />
        </label>
        <button className="primary-button full" disabled={isSubmitting || !spaces.length}>
          {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
        </button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  );
}
