import { Edit3, Plus, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PricingModule } from '../../../types';
import { formatMoney } from '../../../utils/formatters';
import { adminPricingModuleCreatePath, adminPricingModuleEditPath, navigateTo } from '../../../utils/router';
import { detalleDuracionModulo, etiquetaTipoModuloPrecio } from '../../../utils/modulosPrecio';

type ModulosPrecioListadoProps = {
  modulos: PricingModule[];
  onDesactivar: (id: string) => Promise<void>;
};

function etiquetaEspacio(modulo: PricingModule) {
  return modulo.space?.name || modulo.spaceId || 'Sin espacio asociado';
}

function ubicacionEspacio(modulo: PricingModule) {
  const partes = [modulo.space?.floor, modulo.space?.address].filter(Boolean);
  return partes.length ? partes.join(' · ') : 'Espacio vinculado';
}

function estadoModulo(modulo: PricingModule) {
  return modulo.isActive ? 'Activo' : 'Inactivo';
}

export function ModulosPrecioListado({ modulos, onDesactivar }: ModulosPrecioListadoProps) {
  const [busqueda, setBusqueda] = useState('');
  const modulosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return modulos;

    return modulos.filter((modulo) => {
      const valores = [modulo.name, etiquetaEspacio(modulo), modulo.description, modulo.moduleType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return valores.includes(texto);
    });
  }, [busqueda, modulos]);

  return (
    <div className="modulos-admin">
      <header className="modulos-admin__encabezado">
        <div>
          <p className="eyebrow">Configuración comercial</p>
          <h2>Módulos de precio</h2>
          <p>Cada módulo pertenece a un espacio específico. Los cambios impactan en la reserva de ese espacio.</p>
        </div>
        <button className="primary-button" onClick={() => navigateTo(adminPricingModuleCreatePath())}>
          <Plus size={16} /> Nuevo módulo
        </button>
      </header>

      <div className="modulos-admin__barra">
        <div className="modulos-admin__buscador">
          <Search size={16} />
          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por espacio o módulo..."
          />
        </div>
        <span className="modulos-admin__contador">
          {modulosFiltrados.length} {modulosFiltrados.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {!modulosFiltrados.length ? (
        <div className="modulos-admin__vacio">
          <h3>No hay módulos para mostrar</h3>
          <p>Creá el primer módulo y vinculalo a una oficina para poder usarlo en las reservas.</p>
        </div>
      ) : (
        <>
          <div className="modulos-admin__tabla">
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
                {modulosFiltrados.map((modulo) => (
                  <tr key={modulo.id}>
                    <td>
                      <strong>{etiquetaEspacio(modulo)}</strong>
                      <span>{ubicacionEspacio(modulo)}</span>
                    </td>
                    <td>
                      <strong>{modulo.name}</strong>
                      {modulo.description ? <span>{modulo.description}</span> : null}
                    </td>
                    <td>{etiquetaTipoModuloPrecio(modulo.moduleType)}</td>
                    <td>{detalleDuracionModulo(modulo)}</td>
                    <td>{formatMoney(modulo.pricePerHour)}</td>
                    <td><strong>{formatMoney(modulo.totalPrice)}</strong></td>
                    <td>
                      <span className={`estado-chip ${modulo.isActive ? 'estado-chip--activo' : 'estado-chip--inactivo'}`}>
                        {estadoModulo(modulo)}
                      </span>
                    </td>
                    <td>
                      <div className="modulos-admin__acciones">
                        <button title="Editar módulo" onClick={() => navigateTo(adminPricingModuleEditPath(modulo.id))}>
                          <Edit3 size={16} />
                        </button>
                        <button
                          title="Desactivar módulo"
                          disabled={!modulo.isActive}
                          onClick={() => onDesactivar(modulo.id)}
                        >
                          {modulo.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modulos-admin__cards">
            {modulosFiltrados.map((modulo) => (
              <article key={modulo.id} className="modulo-card-mobile">
                <div className="modulo-card-mobile__encabezado">
                  <div>
                    <h3>{etiquetaEspacio(modulo)}</h3>
                    <p>{ubicacionEspacio(modulo)}</p>
                  </div>
                  <span className={`estado-chip ${modulo.isActive ? 'estado-chip--activo' : 'estado-chip--inactivo'}`}>
                    {estadoModulo(modulo)}
                  </span>
                </div>
                <div className="modulo-card-mobile__detalle">
                  <div>
                    <span>Módulo</span>
                    <strong>{modulo.name}</strong>
                  </div>
                  <div>
                    <span>Duración</span>
                    <strong>{detalleDuracionModulo(modulo)}</strong>
                  </div>
                  <div>
                    <span>Precio/h</span>
                    <strong>{formatMoney(modulo.pricePerHour)}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{formatMoney(modulo.totalPrice)}</strong>
                  </div>
                </div>
                <div className="modulo-card-mobile__acciones">
                  <button onClick={() => navigateTo(adminPricingModuleEditPath(modulo.id))}>Editar</button>
                  <button disabled={!modulo.isActive} onClick={() => onDesactivar(modulo.id)}>Desactivar</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
