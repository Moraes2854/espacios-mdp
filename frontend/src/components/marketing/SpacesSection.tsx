import { CheckCircle, MapPin, Users } from 'lucide-react';
import { Space } from '../../types';
import { formatMoney } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { SectionHeading } from '../common/SectionHeading';

type SpacesSectionProps = {
  spaces: Space[];
  selectedSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
};

function coverImage(space: Space) {
  return space.images?.find((image) => image.isCover)?.url || space.images?.[0]?.url || null;
}

function scrollToCalendar() {
  document.getElementById('calendario')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function shortSpaceName(space: Space) {
  return space.name.replace(/oficina\s*\/\s*consultorio\s*privado\s*-?\s*/i, '').trim() || space.name;
}

export function SpacesSection({ spaces, selectedSpaceId, onSelectSpace }: SpacesSectionProps) {
  function handleSelect(spaceId: string) {
    onSelectSpace?.(spaceId);
    scrollToCalendar();
  }

  return (
    <section className="section surface-section spaces-section-premium" id="espacios">
      <SectionHeading title="Nuestros espacios" />

      {!spaces.length ? (
        <EmptyState title="No hay espacios activos" text="Todavía no hay espacios activos para mostrar." />
      ) : (
        <div className="space-grid space-grid-premium">
          {spaces.map((space) => {
            const image = coverImage(space);
            const isSelected = selectedSpaceId === space.id;

            return (
              <article className={`space-card space-card-premium${isSelected ? ' is-selected' : ''}`} key={space.id}>
                <div className="space-image">
                  {image ? <img src={image} alt={space.images?.[0]?.alt || space.name} /> : <div className="space-image-fallback" />}
                  <span className="availability-pill"><CheckCircle size={13} /> Disponible</span>
                </div>
                <div className="space-card-body">
                  <div className="space-card-title">
                    <div>
                      <h3>{shortSpaceName(space)}</h3>
                      <p><MapPin size={15} /> {space.address || 'Dirección pendiente'} {space.floor ? `· ${space.floor}` : ''}</p>
                    </div>
                    <strong>{formatMoney(space.baseHourlyPrice)}<small>/h</small></strong>
                  </div>
                  {space.description && <p className="space-description">{space.description}</p>}
                  <div className="amenity-row">
                    {space.capacity && <span><Users size={14} /> {space.capacity} pers.</span>}
                    {space.amenities?.slice(0, 3).map((amenity) => <span key={amenity.id}>{amenity.name}</span>)}
                  </div>
                  <button className="soft-button full" onClick={() => handleSelect(space.id)}>
                    Alquilar este espacio
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
