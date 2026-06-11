import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PricingModule, PricingModulePayload, Space } from '../../../types';
import { formatMoney } from '../../../utils/formatters';
import {
  TIPOS_MODULO_PRECIO,
  calcularTotalModuloPrecio,
  construirPayloadModuloPrecio,
  crearEstadoInicialModuloPrecio,
  EstadoFormularioModuloPrecio,
  obtenerHorasFacturables,
  validarFormularioModuloPrecio,
} from '../../../utils/modulosPrecio';
import { adminSectionPath, navigateTo } from '../../../utils/router';

type FormularioModuloPrecioProps = {
  espacios: Space[];
  modulo?: PricingModule | null;
  modo: 'crear' | 'editar';
  onGuardar: (datos: PricingModulePayload) => Promise<void>;
  onEliminar?: () => Promise<void>;
};

function actualizarCampo<K extends keyof EstadoFormularioModuloPrecio>(
  estado: EstadoFormularioModuloPrecio,
  campo: K,
  valor: EstadoFormularioModuloPrecio[K],
) {
  return { ...estado, [campo]: valor };
}

function sugerirNombre(estado: EstadoFormularioModuloPrecio) {
  const horas = estado.moduleType === 'WEEKLY_PACK' ? estado.weeklyHours : estado.durationHours;
  if (!horas) return '';
  if (estado.moduleType === 'WEEKLY_PACK') return `${horas} horas semanales`;
  if (Number(horas) === 1) return '1 hora';
  return `${horas} horas`;
}

export function FormularioModuloPrecio({ espacios, modulo, modo, onGuardar, onEliminar }: FormularioModuloPrecioProps) {
  const [estado, setEstado] = useState(() => crearEstadoInicialModuloPrecio(modulo));
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setEstado(crearEstadoInicialModuloPrecio(modulo));
  }, [modulo?.id]);

  const total = useMemo(() => calcularTotalModuloPrecio(estado), [estado]);
  const horasFacturables = useMemo(() => obtenerHorasFacturables(estado), [estado]);

  function cambiarCampo<K extends keyof EstadoFormularioModuloPrecio>(campo: K, valor: EstadoFormularioModuloPrecio[K]) {
    setEstado((actual) => actualizarCampo(actual, campo, valor));
  }

  function autocompletarNombre() {
    const nombre = sugerirNombre(estado);
    if (nombre) cambiarCampo('name', nombre);
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mensajeError = validarFormularioModuloPrecio(estado);
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await onGuardar(construirPayloadModuloPrecio(estado));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el módulo.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!onEliminar) return;
    const confirmado = window.confirm('¿Querés desactivar este módulo? No se eliminarán reservas históricas.');
    if (!confirmado) return;

    setGuardando(true);
    try {
      await onEliminar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar el módulo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="formulario-modulo">
      <header className="formulario-modulo__encabezado">
        <button className="icon-button" onClick={() => navigateTo(adminSectionPath('modules'))} aria-label="Volver a módulos">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="eyebrow">Módulos por espacio</p>
          <h2>{modo === 'crear' ? 'Nuevo módulo de precio' : `Editar módulo: ${modulo?.name || ''}`}</h2>
          <p>Definí duración, precio y espacio asociado. El total se calcula automáticamente.</p>
        </div>
      </header>

      <form className="formulario-modulo__card" onSubmit={guardar}>
        {error ? <div className="formulario-modulo__error">{error}</div> : null}

        <section className="formulario-modulo__seccion">
          <h3>Información principal</h3>
          <div className="form-grid form-grid--full">
            <label>
              <span>Espacio</span>
              <select value={estado.spaceId} onChange={(event) => cambiarCampo('spaceId', event.target.value)}>
                <option value="">Seleccioná una oficina</option>
                {espacios.map((espacio) => (
                  <option key={espacio.id} value={espacio.id}>
                    {espacio.name} {espacio.floor ? `· ${espacio.floor}` : ''}
                  </option>
                ))}
              </select>
              <small>El módulo queda disponible solo para el espacio seleccionado.</small>
            </label>

            <label>
              <span>Nombre del módulo</span>
              <div className="input-with-action">
                <input
                  value={estado.name}
                  onChange={(event) => cambiarCampo('name', event.target.value)}
                  placeholder="Ejemplo: 4 horas"
                />
                <button type="button" onClick={autocompletarNombre}>Sugerir</button>
              </div>
            </label>

            <label>
              <span>Descripción interna</span>
              <textarea
                value={estado.description}
                onChange={(event) => cambiarCampo('description', event.target.value)}
                placeholder="Opcional. Ejemplo: dos bloques de cuatro horas en días distintos."
                rows={3}
              />
            </label>
          </div>
        </section>

        <section className="formulario-modulo__seccion">
          <h3>Configuración de precio</h3>
          <div className="tipo-modulo-grid">
            {TIPOS_MODULO_PRECIO.map((tipo) => (
              <button
                type="button"
                key={tipo.value}
                className={estado.moduleType === tipo.value ? 'tipo-modulo-card tipo-modulo-card--activo' : 'tipo-modulo-card'}
                onClick={() => cambiarCampo('moduleType', tipo.value)}
              >
                <strong>{tipo.label}</strong>
                <span>{tipo.help}</span>
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label>
              <span>{estado.moduleType === 'WEEKLY_PACK' ? 'Horas por bloque' : 'Duración'}</span>
              <input
                value={estado.durationHours}
                onChange={(event) => cambiarCampo('durationHours', event.target.value)}
                inputMode="numeric"
                type="number"
                min="1"
                placeholder={estado.moduleType === 'WEEKLY_PACK' ? '4' : '1'}
              />
            </label>

            {estado.moduleType === 'WEEKLY_PACK' ? (
              <label>
                <span>Horas semanales</span>
                <input
                  value={estado.weeklyHours}
                  onChange={(event) => cambiarCampo('weeklyHours', event.target.value)}
                  inputMode="numeric"
                  type="number"
                  min="1"
                  placeholder="8"
                />
              </label>
            ) : null}

            <label>
              <span>Precio por hora</span>
              <input
                value={estado.pricePerHour}
                onChange={(event) => cambiarCampo('pricePerHour', event.target.value)}
                inputMode="numeric"
                type="number"
                min="0"
                placeholder="7500"
              />
            </label>

            <label>
              <span>Orden</span>
              <input
                value={estado.sortOrder}
                onChange={(event) => cambiarCampo('sortOrder', event.target.value)}
                inputMode="numeric"
                type="number"
                placeholder="0"
              />
            </label>
          </div>
        </section>

        <section className="formulario-modulo__resumen">
          <div>
            <span>Horas facturables</span>
            <strong>{horasFacturables || 0}</strong>
          </div>
          <div>
            <span>Precio por hora</span>
            <strong>{formatMoney(estado.pricePerHour || 0)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </section>

        <section className="formulario-modulo__estado">
          <div>
            <h3>Estado del módulo</h3>
            <p>Si está inactivo no se mostrará para nuevas reservas, pero se conserva el historial.</p>
          </div>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={estado.isActive}
              onChange={(event) => cambiarCampo('isActive', event.target.checked)}
            />
            <span>{estado.isActive ? 'Activo' : 'Inactivo'}</span>
          </label>
        </section>

        <footer className="formulario-modulo__acciones">
          {modo === 'editar' ? (
            <button type="button" className="danger-button" onClick={eliminar} disabled={guardando}>
              <Trash2 size={16} /> Desactivar
            </button>
          ) : <span />}

          <div>
            <button type="button" className="ghost-button" onClick={() => navigateTo(adminSectionPath('modules'))} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={guardando}>
              <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar módulo'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
