import { Edit3, Plus, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Space } from '../../../types';
import { formatMoney } from '../../../utils/formatters';
import { getAmenitiesLabel, getSpaceLocation } from '../../../utils/spacesAdmin';
import { adminSpaceCreatePath, adminSpaceEditPath, navigateTo } from '../../../utils/router';

type SpacesListProps = {
  spaces: Space[];
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
};

function getStatusLabel(space: Space) {
  return space.isActive ? 'Activo' : 'Inactivo';
}

export function SpacesList({ spaces, onToggleActive }: SpacesListProps) {
  const [search, setSearch] = useState('');

  const filteredSpaces = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return spaces;

    return spaces.filter((space) => {
      const values = [
        space.name,
        space.floor,
        space.address,
        space.description,
        ...(space.amenities || []).map((item) => item.amenity?.name || item.name || ''),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(text);
    });
  }, [search, spaces]);

  return (
    <div className="admin-resource">
      <header className="admin-resource__header">
        <div>
          <p className="eyebrow">Inventario operativo</p>
          <h2>Espacios</h2>
          <p>Administrá oficinas, ubicación, capacidad, valores base y servicios incluidos.</p>
        </div>
        <button className="primary-button" onClick={() => navigateTo(adminSpaceCreatePath())}>
          <Plus size={16} /> Nuevo espacio
        </button>
      </header>

      <div className="admin-resource__toolbar">
        <div className="admin-resource__search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, piso, dirección o servicio..."
          />
        </div>
        <span className="admin-resource__counter">
          {filteredSpaces.length} {filteredSpaces.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {!filteredSpaces.length ? (
        <div className="admin-resource__empty">
          <h3>No hay espacios para mostrar</h3>
          <p>Creá el primer espacio para poder vincular servicios, módulos de precio y reservas.</p>
        </div>
      ) : (
        <>
          <div className="admin-resource__table">
            <table>
              <thead>
                <tr>
                  <th>Espacio</th>
                  <th>Ubicación</th>
                  <th>Capacidad</th>
                  <th>Precio/h</th>
                  <th>Recurrente/h</th>
                  <th>Servicios incluidos</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filteredSpaces.map((space) => (
                  <tr key={space.id}>
                    <td>
                      <strong>{space.name}</strong>
                      {space.description ? <span>{space.description}</span> : <span>{space.slug}</span>}
                    </td>
                    <td>
                      <strong>{space.floor || 'Sin piso/oficina'}</strong>
                      <span>{space.address || 'Sin dirección cargada'}</span>
                    </td>
                    <td>{space.capacity ? `${space.capacity} personas` : 'Sin dato'}</td>
                    <td><strong>{formatMoney(space.baseHourlyPrice)}</strong></td>
                    <td>{space.recurrentHourlyPrice ? formatMoney(space.recurrentHourlyPrice) : '-'}</td>
                    <td>{getAmenitiesLabel(space)}</td>
                    <td>
                      <span className={`status-chip ${space.isActive ? 'status-chip--active' : 'status-chip--inactive'}`}>
                        {getStatusLabel(space)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-resource__actions">
                        <button title="Editar espacio" onClick={() => navigateTo(adminSpaceEditPath(space.id))}>
                          <Edit3 size={16} />
                        </button>
                        <button
                          title={space.isActive ? 'Desactivar espacio' : 'Activar espacio'}
                          onClick={() => onToggleActive(space.id, !space.isActive)}
                        >
                          {space.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-resource__cards">
            {filteredSpaces.map((space) => (
              <article key={space.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <h3>{space.name}</h3>
                    <p>{getSpaceLocation(space)}</p>
                  </div>
                  <span className={`status-chip ${space.isActive ? 'status-chip--active' : 'status-chip--inactive'}`}>
                    {getStatusLabel(space)}
                  </span>
                </div>
                <div className="admin-mobile-card__details">
                  <div>
                    <span>Capacidad</span>
                    <strong>{space.capacity ? `${space.capacity} personas` : 'Sin dato'}</strong>
                  </div>
                  <div>
                    <span>Precio/h</span>
                    <strong>{formatMoney(space.baseHourlyPrice)}</strong>
                  </div>
                  <div>
                    <span>Recurrente/h</span>
                    <strong>{space.recurrentHourlyPrice ? formatMoney(space.recurrentHourlyPrice) : '-'}</strong>
                  </div>
                  <div>
                    <span>Servicios</span>
                    <strong>{space.amenities?.length || 0}</strong>
                  </div>
                </div>
                <p className="admin-mobile-card__text">{getAmenitiesLabel(space)}</p>
                <div className="admin-mobile-card__actions">
                  <button onClick={() => navigateTo(adminSpaceEditPath(space.id))}>Editar</button>
                  <button onClick={() => onToggleActive(space.id, !space.isActive)}>
                    {space.isActive ? 'Desactivar' : 'Activar'}
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
