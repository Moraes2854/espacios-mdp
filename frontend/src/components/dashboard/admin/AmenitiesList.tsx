import { Edit3, Plus, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Amenity } from '../../../types';
import { adminAmenityCreatePath, adminAmenityEditPath, navigateTo } from '../../../utils/router';

type AmenitiesListProps = {
  amenities: Amenity[];
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
};

function getStatusLabel(amenity: Amenity) {
  return amenity.isActive ? 'Activo' : 'Inactivo';
}

export function AmenitiesList({ amenities, onToggleActive }: AmenitiesListProps) {
  const [search, setSearch] = useState('');

  const filteredAmenities = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return amenities;

    return amenities.filter((amenity) => {
      const values = [amenity.name, amenity.description, amenity.category, amenity.icon]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(text);
    });
  }, [amenities, search]);

  return (
    <div className="admin-resource">
      <header className="admin-resource__header">
        <div>
          <p className="eyebrow">Catálogo global</p>
          <h2>Servicios incluidos</h2>
          <p>Creá servicios una sola vez y asigná el mismo servicio a distintos espacios.</p>
        </div>
        <button className="primary-button" onClick={() => navigateTo(adminAmenityCreatePath())}>
          <Plus size={16} /> Nuevo servicio
        </button>
      </header>

      <div className="admin-resource__toolbar">
        <div className="admin-resource__search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, categoría o icono..."
          />
        </div>
        <span className="admin-resource__counter">
          {filteredAmenities.length} {filteredAmenities.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {!filteredAmenities.length ? (
        <div className="admin-resource__empty">
          <h3>No hay servicios para mostrar</h3>
          <p>Creá servicios como WiFi, limpieza, climatización o cerradura inteligente.</p>
        </div>
      ) : (
        <>
          <div className="admin-resource__table">
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Categoría</th>
                  <th>Icono</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filteredAmenities.map((amenity) => (
                  <tr key={amenity.id}>
                    <td>
                      <strong>{amenity.name}</strong>
                      {amenity.description ? <span>{amenity.description}</span> : <span>{amenity.slug}</span>}
                    </td>
                    <td>{amenity.category || 'General'}</td>
                    <td>
                      <span className="amenity-icon-preview">
                        <span className="material-symbols-outlined">{amenity.icon || 'check_circle'}</span>
                        {amenity.icon || 'check_circle'}
                      </span>
                    </td>
                    <td>{amenity.sortOrder}</td>
                    <td>
                      <span className={`status-chip ${amenity.isActive ? 'status-chip--active' : 'status-chip--inactive'}`}>
                        {getStatusLabel(amenity)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-resource__actions">
                        <button title="Editar servicio" onClick={() => navigateTo(adminAmenityEditPath(amenity.id))}>
                          <Edit3 size={16} />
                        </button>
                        <button
                          title={amenity.isActive ? 'Desactivar servicio' : 'Activar servicio'}
                          onClick={() => onToggleActive(amenity.id, !amenity.isActive)}
                        >
                          {amenity.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-resource__cards">
            {filteredAmenities.map((amenity) => (
              <article key={amenity.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <h3>{amenity.name}</h3>
                    <p>{amenity.description || amenity.slug}</p>
                  </div>
                  <span className={`status-chip ${amenity.isActive ? 'status-chip--active' : 'status-chip--inactive'}`}>
                    {getStatusLabel(amenity)}
                  </span>
                </div>
                <div className="admin-mobile-card__details">
                  <div>
                    <span>Categoría</span>
                    <strong>{amenity.category || 'General'}</strong>
                  </div>
                  <div>
                    <span>Icono</span>
                    <strong>{amenity.icon || 'check_circle'}</strong>
                  </div>
                  <div>
                    <span>Orden</span>
                    <strong>{amenity.sortOrder}</strong>
                  </div>
                  <div>
                    <span>Estado</span>
                    <strong>{getStatusLabel(amenity)}</strong>
                  </div>
                </div>
                <div className="admin-mobile-card__actions">
                  <button onClick={() => navigateTo(adminAmenityEditPath(amenity.id))}>Editar</button>
                  <button onClick={() => onToggleActive(amenity.id, !amenity.isActive)}>
                    {amenity.isActive ? 'Desactivar' : 'Activar'}
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
