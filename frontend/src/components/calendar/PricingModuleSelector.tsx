import { CheckCircle } from 'lucide-react';
import { PricingModule } from '../../types';
import { formatMoney } from '../../utils/formatters';
import { isBestHourlyRate, moduleDisplayName, moduleSecondaryLabel } from '../../utils/pricingModules';

type PricingModuleSelectorProps = {
  modules: PricingModule[];
  selectedModuleId: string;
  onModuleChange: (moduleId: string) => void;
};

export function PricingModuleSelector({ modules, selectedModuleId, onModuleChange }: PricingModuleSelectorProps) {
  if (!modules.length) return null;

  return (
    <section className="selector-card calendar-module-selector" aria-label="Seleccionar módulo de reserva">
      <div className="selector-title-row">
        <div>
          <span className="selector-step">2</span>
          <h4>Elegí la duración</h4>
        </div>
        <p>El bloque seleccionado tiene que estar completo en el calendario.</p>
      </div>

      <div className="calendar-module-list" role="list">
        {modules.map((module) => {
          const isSelected = selectedModuleId === module.id;
          const bestHourlyRate = isBestHourlyRate(module);

          return (
            <button
              key={module.id}
              type="button"
              className={`calendar-module-option${isSelected ? ' is-selected' : ''}${bestHourlyRate ? ' has-best-rate' : ''}`}
              onClick={() => onModuleChange(module.id)}
              aria-pressed={isSelected}
            >
              <span className="module-card-topline">
                {isSelected ? <CheckCircle size={18} /> : <span aria-hidden="true" />}
              </span>
              <strong>{moduleDisplayName(module)}</strong>
              <small>{moduleSecondaryLabel(module)}</small>
              <em>{formatMoney(module.totalPrice)}</em>
              <span className="module-per-hour">
                {formatMoney(module.pricePerHour)} / h
                {bestHourlyRate && <b>Mejor precio por hora</b>}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
