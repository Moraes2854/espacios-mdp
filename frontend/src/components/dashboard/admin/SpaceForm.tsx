import { ArrowLeft, Plus, Save, Trash2, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Amenity, AmenityPayload, Space, SpacePayload } from '../../../types';
import { buildSpacePayload, createEmptySpaceFormState, createSpaceFormState, sortAmenities, SpaceFormState } from '../../../utils/spacesAdmin';
import { adminSectionPath, navigateTo } from '../../../utils/router';

type SpaceFormProps = {
  mode: 'create' | 'edit';
  space?: Space;
  amenities: Amenity[];
  onCreateAmenity: (data: AmenityPayload) => Promise<Amenity>;
  onSave: (data: SpacePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function validateForm(state: SpaceFormState) {
  if (!state.name.trim()) return 'Ingresá el nombre del espacio.';
  if (Number(state.baseHourlyPrice) <= 0) return 'Ingresá un precio base por hora válido.';
  return null;
}

function toggleId(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((currentId) => currentId !== id) : [...ids, id];
}

export function SpaceForm({ mode, space, amenities, onCreateAmenity, onSave, onDelete }: SpaceFormProps) {
  const [state, setState] = useState<SpaceFormState>(() => (space ? createSpaceFormState(space) : createEmptySpaceFormState()));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingAmenity, setIsCreatingAmenity] = useState(false);

  const activeAmenities = useMemo(() => sortAmenities(amenities.filter((amenity) => amenity.isActive)), [amenities]);

  function updateField<K extends keyof SpaceFormState>(key: K, value: SpaceFormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  async function handleCreateAmenity() {
    const name = state.newAmenityName.trim();
    if (!name) {
      setError('Ingresá el nombre del servicio que querés crear.');
      return;
    }

    setIsCreatingAmenity(true);
    setError(null);
    try {
      const amenity = await onCreateAmenity({
        name,
        icon: state.newAmenityIcon.trim() || 'check_circle',
        category: state.newAmenityCategory.trim() || 'General',
        isActive: true,
      });
      setState((current) => ({
        ...current,
        amenityIds: Array.from(new Set([...current.amenityIds, amenity.id])),
        newAmenityName: '',
        newAmenityIcon: 'check_circle',
        newAmenityCategory: 'General',
      }));
    } catch (amenityError) {
      setError(amenityError instanceof Error ? amenityError.message : 'No se pudo crear el servicio.');
    } finally {
      setIsCreatingAmenity(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validateForm(state);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(buildSpacePayload(state));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el espacio.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <header className="admin-form__header">
        <div>
          <p className="eyebrow">Espacios</p>
          <h2>{mode === 'create' ? 'Nuevo espacio' : `Editar espacio: ${space?.name || ''}`}</h2>
          <p>Definí la información comercial, operativa y los servicios incluidos.</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => navigateTo(adminSectionPath('spaces'))}>
          <ArrowLeft size={16} /> Volver
        </button>
      </header>

      <section className="admin-form__card">
        {error ? <div className="admin-form__error">{error}</div> : null}

        <div className="admin-form__section">
          <h3>Información principal</h3>
          <div className="form-grid">
            <label>
              <span>Nombre</span>
              <input value={state.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Ej: Piso 1 Oficina 14" />
            </label>
            <label>
              <span>Slug</span>
              <input value={state.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="Se genera automáticamente si queda vacío" />
            </label>
            <label>
              <span>Piso / oficina</span>
              <input value={state.floor} onChange={(event) => updateField('floor', event.target.value)} placeholder="Ej: Piso 1 · Oficina 14" />
            </label>
            <label>
              <span>Capacidad</span>
              <input type="number" min="1" value={state.capacity} onChange={(event) => updateField('capacity', event.target.value)} placeholder="Ej: 2" />
            </label>
          </div>
          <label>
            <span>Dirección</span>
            <input value={state.address} onChange={(event) => updateField('address', event.target.value)} placeholder="Rivadavia 3174, Mar del Plata, Buenos Aires" />
          </label>
          <label>
            <span>Descripción</span>
            <textarea
              rows={4}
              value={state.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Ej: Oficina privada equipada para atención profesional por hora."
            />
          </label>
        </div>

        <div className="admin-form__section">
          <h3>Valores base</h3>
          <div className="form-grid">
            <label>
              <span>Precio base por hora</span>
              <input type="number" min="0" value={state.baseHourlyPrice} onChange={(event) => updateField('baseHourlyPrice', event.target.value)} />
            </label>
            <label>
              <span>Precio recurrente por hora</span>
              <input type="number" min="0" value={state.recurrentHourlyPrice} onChange={(event) => updateField('recurrentHourlyPrice', event.target.value)} placeholder="Opcional" />
              <small>Se usa como referencia comercial. Los módulos siguen definiendo el precio final.</small>
            </label>
          </div>
        </div>

        <div className="admin-form__section">
          <div className="admin-form__section-titleline">
            <div>
              <h3>Servicios incluidos</h3>
              <p>Seleccioná servicios del catálogo global. Un mismo servicio puede estar asignado a varios espacios.</p>
            </div>
            <span className="admin-resource__counter">{state.amenityIds.length} seleccionados</span>
          </div>

          {activeAmenities.length ? (
            <div className="amenity-picker">
              {activeAmenities.map((amenity) => {
                const isSelected = state.amenityIds.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    className={`amenity-picker__item ${isSelected ? 'amenity-picker__item--active' : ''}`}
                    onClick={() => updateField('amenityIds', toggleId(state.amenityIds, amenity.id))}
                  >
                    <span className="material-symbols-outlined">{amenity.icon || 'check_circle'}</span>
                    <strong>{amenity.name}</strong>
                    {isSelected ? <X size={14} /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="admin-resource__empty admin-resource__empty--compact">
              <h3>No hay servicios cargados</h3>
              <p>Creá el primer servicio desde este mismo formulario.</p>
            </div>
          )}

          <div className="inline-create-card">
            <div>
              <h4>Crear servicio rápido</h4>
              <p>Ej: WiFi, limpieza incluida, aire acondicionado, monitor, cerradura inteligente.</p>
            </div>
            <div className="inline-create-card__grid">
              <input value={state.newAmenityName} onChange={(event) => updateField('newAmenityName', event.target.value)} placeholder="Nombre del servicio" />
              <input value={state.newAmenityIcon} onChange={(event) => updateField('newAmenityIcon', event.target.value)} placeholder="Icono Material Symbols" />
              <input value={state.newAmenityCategory} onChange={(event) => updateField('newAmenityCategory', event.target.value)} placeholder="Categoría" />
              <button type="button" onClick={handleCreateAmenity} disabled={isCreatingAmenity}>
                <Plus size={16} /> {isCreatingAmenity ? 'Creando...' : 'Crear y asignar'}
              </button>
            </div>
          </div>
        </div>

        <div className="admin-form__status">
          <div>
            <h3>Estado</h3>
            <p>Solo los espacios activos aparecen en la web pública y en el calendario.</p>
          </div>
          <label className="switch-line">
            <input type="checkbox" checked={state.isActive} onChange={(event) => updateField('isActive', event.target.checked)} />
            {state.isActive ? 'Activo' : 'Inactivo'}
          </label>
        </div>

        <div className="admin-form__actions">
          {mode === 'edit' && onDelete ? (
            <button type="button" className="danger-button" onClick={onDelete}>
              <Trash2 size={16} /> Desactivar
            </button>
          ) : <span />}
          <div>
            <button type="button" onClick={() => navigateTo(adminSectionPath('spaces'))}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Guardando...' : 'Guardar espacio'}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
