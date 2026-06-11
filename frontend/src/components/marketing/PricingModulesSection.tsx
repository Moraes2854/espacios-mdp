import { PricingModule } from '../../types';
import { formatMoney } from '../../utils/formatters';
import { getPricingModulesForSpace, isBestHourlyRate, moduleDisplayName, moduleSavingsLabel, moduleSecondaryLabel } from '../../utils/pricingModules';
import { EmptyState } from '../common/EmptyState';
import { SectionHeading } from '../common/SectionHeading';

type PricingModulesSectionProps = {
  pricingModules: PricingModule[];
  selectedSpaceId?: string;
  selectedSpaceName?: string;
};

function modulesForMarketing(pricingModules: PricingModule[], selectedSpaceId?: string) {
  return getPricingModulesForSpace(pricingModules, selectedSpaceId || '')
    .filter((module) => module.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .slice(0, 9);
}

export function PricingModulesSection({ pricingModules, selectedSpaceId, selectedSpaceName }: PricingModulesSectionProps) {
  const activeModules = modulesForMarketing(pricingModules, selectedSpaceId);

  return (
    <section className="section pricing-section-premium" id="modulos">
      <SectionHeading
        title="Módulos de reserva"
        text={selectedSpaceName ? `Precios disponibles para ${selectedSpaceName}.` : 'Elegí el espacio para ver sus módulos disponibles.'}
        align="center"
      />

      {!activeModules.length ? (
        <EmptyState title="No hay módulos cargados" text="Todavía no hay módulos de precio activos para este espacio." />
      ) : (
        <div className="pricing-grid pricing-grid-premium">
          {activeModules.map((module) => {
            const bestRate = isBestHourlyRate(module);

            return (
              <article className={`price-card price-card-premium ${bestRate ? 'best-hourly-rate' : ''}`} key={module.id}>
                <h3>{moduleDisplayName(module)}</h3>
                <small>{moduleSecondaryLabel(module)}</small>
                <strong>{formatMoney(module.totalPrice)}</strong>
                <p>
                  {moduleSavingsLabel(module)}
                  {bestRate && <b>Mejor precio por hora</b>}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
