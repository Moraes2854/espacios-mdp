import { CheckCircle, Image as ImageIcon, MapPin } from 'lucide-react';
import { Space } from '../../types';
import { formatMoney } from '../../utils/formatters';
import { spaceCoverUrl, spaceLocationLabel, spaceShortName } from '../../utils/spaces';

type SpaceSelectorProps = {
  spaces: Space[];
  selectedSpace?: Space;
  selectedSpaceId: string;
  onSpaceChange: (spaceId: string) => void;
};

export function SpaceSelector({ spaces, selectedSpaceId, onSpaceChange }: SpaceSelectorProps) {
  if (!spaces.length) return null;

  return (
    <section className="selector-card calendar-space-selector" aria-label="Seleccionar espacio">
      <div className="selector-title-row">
        <div>
          <span className="selector-step">1</span>
          <h4>Seleccioná tu espacio</h4>
        </div>
        <p>Elegí la oficina antes de consultar horarios.</p>
      </div>

      <div className="calendar-space-list" role="list">
        {spaces.map((space) => {
          const cover = spaceCoverUrl(space);
          const isSelected = selectedSpaceId === space.id;

          return (
            <button
              key={space.id}
              type="button"
              className={`calendar-space-option${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSpaceChange(space.id)}
              aria-pressed={isSelected}
            >
              <span className="calendar-space-thumb" aria-hidden="true">
                {cover ? <img src={cover} alt="" /> : <ImageIcon size={20} />}
              </span>
              <span className="calendar-space-copy">
                <strong>{spaceShortName(space)}</strong>
                <small><MapPin size={13} /> {spaceLocationLabel(space)}</small>
                <em>Desde {formatMoney(space.baseHourlyPrice)} / h</em>
              </span>
              <span className="space-selected-icon" aria-hidden="true">
                {isSelected ? <CheckCircle size={20} /> : <span />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
