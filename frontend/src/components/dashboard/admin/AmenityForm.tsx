import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Amenity, AmenityPayload } from '../../../types';
import { buildAmenityPayload, createAmenityFormState, createEmptyAmenityFormState, AmenityFormState } from '../../../utils/amenitiesAdmin';
import { adminSectionPath, navigateTo } from '../../../utils/router';

type AmenityFormProps = {
  mode: 'create' | 'edit';
  amenity?: Amenity;
  onSave: (data: AmenityPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function validateForm(state: AmenityFormState) {
  if (!state.name.trim()) return 'Ingresá el nombre del servicio.';
  return null;
}

export function AmenityForm({ mode, amenity, onSave, onDelete }: AmenityFormProps) {
  const [state, setState] = useState<AmenityFormState>(() => (amenity ? createAmenityFormState(amenity) : createEmptyAmenityFormState()));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof AmenityFormState>(key: K, value: AmenityFormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
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
      await onSave(buildAmenityPayload(state));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el servicio.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <header className="admin-form__header">
        <div>
          <p className="eyebrow">Servicios incluidos</p>
          <h2>{mode === 'create' ? 'Nuevo servicio' : `Editar servicio: ${amenity?.name || ''}`}</h2>
          <p>Definí un servicio reutilizable para asignarlo a uno o más espacios.</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => navigateTo(adminSectionPath('amenities'))}>
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
              <input value={state.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Ej: WiFi" />
            </label>
            <label>
              <span>Slug</span>
              <input value={state.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="Se genera automáticamente si queda vacío" />
            </label>
            <label>
              <span>Icono</span>
              <input value={state.icon} onChange={(event) => updateField('icon', event.target.value)} placeholder="Ej: wifi" />
              <small>Usá nombres de Material Symbols: wifi, ac_unit, cleaning_services, security.</small>
            </label>
            <label>
              <span>Categoría</span>
              <input value={state.category} onChange={(event) => updateField('category', event.target.value)} placeholder="Ej: Confort" />
            </label>
            <label>
              <span>Orden</span>
              <input type="number" min="0" value={state.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} />
            </label>
          </div>
          <label>
            <span>Descripción</span>
            <textarea
              rows={4}
              value={state.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Ej: Conexión WiFi incluida durante toda la reserva."
            />
          </label>
        </div>

        <div className="admin-form__status">
          <div>
            <h3>Estado</h3>
            <p>Los servicios inactivos no se pueden asignar a nuevos espacios, pero se conservan para historial.</p>
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
            <button type="button" onClick={() => navigateTo(adminSectionPath('amenities'))}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Guardando...' : 'Guardar servicio'}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
