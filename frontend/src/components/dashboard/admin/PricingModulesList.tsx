import { Edit3, Plus, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PricingModule } from '../../../types';
import { formatMoney } from '../../../utils/formatters';
import { getPricingModuleDurationDetail, getPricingModuleTypeLabel } from '../../../utils/pricingModulesAdmin';
import { adminPricingModuleCreatePath, adminPricingModuleEditPath, navigateTo } from '../../../utils/router';

type PricingModulesListProps = {
  modules: PricingModule[];
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
};

function getSpaceLabel(module: PricingModule) {
  return module.space?.name || module.spaceId || 'Sin espacio asociado';
}

function getSpaceLocation(module: PricingModule) {
  const parts = [module.space?.floor, module.space?.address].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Espacio vinculado';
}

function getStatusLabel(module: PricingModule) {
  return module.isActive ? 'Activo' : 'Inactivo';
}

export function PricingModulesList({ modules, onToggleActive }: PricingModulesListProps) {
  const [search, setSearch] = useState('');

  const filteredModules = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return modules;

    return modules.filter((module) => {
      const values = [module.name, getSpaceLabel(module), module.description, module.moduleType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(text);
    });
  }, [search, modules]);

  return (
    <div className="admin-resource">
      <header className="admin-resource__header">
        <div>
          <p className="eyebrow">Configuración comercial</p>
          <h2>Módulos de precio</h2>
          <p>Cada módulo pertenece a un espacio específico. Los cambios impactan en la reserva de ese espacio.</p>
        </div>
        <button className="primary-button" onClick={() => navigateTo(adminPricingModuleCreatePath())}>
          <Plus size={16} /> Nuevo módulo
        </button>
      </header>

      <div className="admin-resource__toolbar">
        <div className="admin-resource__search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por espacio o módulo..."
          />
        </div>
        <span className="admin-resource__counter">
          {filteredModules.length} {filteredModules.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {!filteredModules.length ? (
        <div className="admin-resource__empty">
          <h3>No hay módulos para mostrar</h3>
          <p>Creá el primer módulo y vinculalo a una oficina para poder usarlo en las reservas.</p>
        </div>
      ) : (
        <>
          <div className="admin-resource__table">
            <table>
              <thead>
                <tr>
                  <th>Espacio</th>
                  <th>Módulo</th>
                  <th>Tipo</th>
                  <th>Duración</th>
                  <th>Precio/h</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filteredModules.map((module) => (
                  <tr key={module.id}>
                    <td>
                      <strong>{getSpaceLabel(module)}</strong>
                      <span>{getSpaceLocation(module)}</span>
                    </td>
                    <td>
                      <strong>{module.name}</strong>
                      {module.description ? <span>{module.description}</span> : null}
                    </td>
                    <td>{getPricingModuleTypeLabel(module.moduleType)}</td>
                    <td>{getPricingModuleDurationDetail(module)}</td>
                    <td>{formatMoney(module.pricePerHour)}</td>
                    <td><strong>{formatMoney(module.totalPrice)}</strong></td>
                    <td>
                      <span className={`status-chip ${module.isActive ? 'status-chip--active' : 'status-chip--inactive'}`}>
                        {getStatusLabel(module)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-resource__actions">
                        <button title="Editar módulo" onClick={() => navigateTo(adminPricingModuleEditPath(module.id))}>
                          <Edit3 size={16} />
                        </button>
                        <button
                          title={module.isActive ? 'Desactivar módulo' : 'Activar módulo'}
                          onClick={() => onToggleActive(module.id, !module.isActive)}
                        >
                          {module.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-resource__cards">
            {filteredModules.map((module) => (
              <article key={module.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <h3>{getSpaceLabel(module)}</h3>
                    <p>{getSpaceLocation(module)}</p>
                  </div>
                  <span className={`status-chip ${module.isActive ? 'status-chip--active' : 'status-chip--inactive'}`}>
                    {getStatusLabel(module)}
                  </span>
                </div>
                <div className="admin-mobile-card__details">
                  <div>
                    <span>Módulo</span>
                    <strong>{module.name}</strong>
                  </div>
                  <div>
                    <span>Duración</span>
                    <strong>{getPricingModuleDurationDetail(module)}</strong>
                  </div>
                  <div>
                    <span>Precio/h</span>
                    <strong>{formatMoney(module.pricePerHour)}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{formatMoney(module.totalPrice)}</strong>
                  </div>
                </div>
                <div className="admin-mobile-card__actions">
                  <button onClick={() => navigateTo(adminPricingModuleEditPath(module.id))}>Editar</button>
                  <button onClick={() => onToggleActive(module.id, !module.isActive)}>
                    {module.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
