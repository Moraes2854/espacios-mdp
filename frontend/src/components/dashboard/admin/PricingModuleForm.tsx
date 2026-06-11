import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { PricingModule, PricingModulePayload, PricingModuleType, Space } from '../../../types';
import { formatMoney } from '../../../utils/formatters';
import {
  buildPricingModulePayload,
  calculatePricingModuleTotal,
  createEmptyPricingModuleFormState,
  createPricingModuleFormState,
  PricingModuleFormState,
  pricingModuleTypeOptions,
} from '../../../utils/pricingModulesAdmin';
import { adminSectionPath, navigateTo } from '../../../utils/router';

type PricingModuleFormProps = {
  mode: 'create' | 'edit';
  spaces: Space[];
  module?: PricingModule;
  onSave: (data: PricingModulePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function validateForm(state: PricingModuleFormState) {
  if (!state.spaceId) return 'Seleccioná el espacio al que pertenece este módulo.';
  if (!state.name.trim()) return 'Ingresá el nombre del módulo.';
  if (Number(state.pricePerHour) <= 0) return 'Ingresá un precio por hora válido.';

  if (state.moduleType === 'WEEKLY_PACK') {
    if (Number(state.weeklyHours) <= 0) return 'Ingresá las horas semanales del pack.';
    return null;
  }

  if (Number(state.durationHours) <= 0) return 'Ingresá la duración del módulo.';
  return null;
}

export function PricingModuleForm({ mode, spaces, module, onSave, onDelete }: PricingModuleFormProps) {
  const [state, setState] = useState<PricingModuleFormState>(() => (
    module ? createPricingModuleFormState(module) : createEmptyPricingModuleFormState(spaces[0]?.id || '')
  ));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(() => calculatePricingModuleTotal(state), [state]);
  const selectedSpace = spaces.find((space) => space.id === state.spaceId);

  function updateField<K extends keyof PricingModuleFormState>(key: K, value: PricingModuleFormState[K]) {
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
      await onSave(buildPricingModulePayload(state));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el módulo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <header className="admin-form__header">
        <div>
          <p className="eyebrow">Módulos de precio</p>
          <h2>{mode === 'create' ? 'Nuevo módulo' : `Editar módulo: ${module?.name || ''}`}</h2>
          <p>Configurá la duración, el precio y el espacio al que aplica.</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => navigateTo(adminSectionPath('modules'))}>
          <ArrowLeft size={16} /> Volver
        </button>
      </header>

      <section className="admin-form__card">
        {error ? <div className="admin-form__error">{error}</div> : null}

        <div className="admin-form__section">
          <h3>Espacio vinculado</h3>
          <label>
            <span>Espacio</span>
            <select value={state.spaceId} onChange={(event) => updateField('spaceId', event.target.value)}>
              <option value="">Seleccioná un espacio</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name} {space.floor ? `· ${space.floor}` : ''}
                </option>
              ))}
            </select>
            <small>{selectedSpace?.address || 'El módulo solo podrá usarse para el espacio seleccionado.'}</small>
          </label>
        </div>

        <div className="admin-form__section">
          <h3>Información del módulo</h3>
          <div className="form-grid">
            <label>
              <span>Nombre</span>
              <input value={state.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Ej: 4 horas" />
            </label>
            <label>
              <span>Slug</span>
              <input value={state.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="Se genera automáticamente si queda vacío" />
            </label>
          </div>
          <label>
            <span>Descripción</span>
            <textarea
              rows={3}
              value={state.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Ej: Bloque de 4 horas corridas."
            />
          </label>
        </div>

        <div className="admin-form__section">
          <h3>Tipo de módulo</h3>
          <div className="option-grid">
            {pricingModuleTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`option-card ${state.moduleType === option.value ? 'option-card--active' : ''}`}
                onClick={() => updateField('moduleType', option.value)}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-form__section">
          <h3>Precio y duración</h3>
          <div className="form-grid">
            <label>
              <span>Duración por bloque</span>
              <input
                type="number"
                min="1"
                value={state.durationHours}
                onChange={(event) => updateField('durationHours', event.target.value)}
                disabled={state.moduleType === 'SINGLE'}
              />
              <small>Para pack semanal, representa la duración de cada bloque.</small>
            </label>
            <label>
              <span>Horas semanales</span>
              <input
                type="number"
                min="1"
                value={state.weeklyHours}
                onChange={(event) => updateField('weeklyHours', event.target.value)}
                disabled={state.moduleType !== 'WEEKLY_PACK'}
              />
            </label>
            <label>
              <span>Precio por hora</span>
              <input type="number" min="0" value={state.pricePerHour} onChange={(event) => updateField('pricePerHour', event.target.value)} />
            </label>
            <label>
              <span>Total manual</span>
              <input type="number" min="0" value={state.totalPrice} onChange={(event) => updateField('totalPrice', event.target.value)} placeholder="Opcional" />
              <small>Si lo dejás vacío, se calcula automáticamente.</small>
            </label>
            <label>
              <span>Orden</span>
              <input type="number" value={state.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} />
            </label>
          </div>
        </div>

        <div className="admin-form__summary">
          <div>
            <span>Espacio</span>
            <strong>{selectedSpace?.name || 'Sin espacio'}</strong>
          </div>
          <div>
            <span>Precio/h</span>
            <strong>{formatMoney(state.pricePerHour || 0)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </div>

        <div className="admin-form__status">
          <div>
            <h3>Estado</h3>
            <p>Solo los módulos activos aparecen disponibles para reservar.</p>
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
            <button type="button" onClick={() => navigateTo(adminSectionPath('modules'))}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Guardando...' : 'Guardar módulo'}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
