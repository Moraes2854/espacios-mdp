import { PricingModule, PricingModulePayload, PricingModuleType } from '../types';

export const TIPOS_MODULO_PRECIO: Array<{ value: PricingModuleType; label: string; help: string }> = [
  { value: 'SINGLE', label: 'Hora simple', help: 'Reserva puntual de una hora.' },
  { value: 'CONTINUOUS_BLOCK', label: 'Bloque corrido', help: 'Varias horas consecutivas en el mismo día.' },
  { value: 'WEEKLY_PACK', label: 'Pack semanal', help: 'Horas distribuidas en bloques durante la semana.' },
];

export type EstadoFormularioModuloPrecio = {
  spaceId: string;
  name: string;
  description: string;
  moduleType: PricingModuleType;
  durationHours: string;
  weeklyHours: string;
  pricePerHour: string;
  sortOrder: string;
  isActive: boolean;
};

export function crearEstadoInicialModuloPrecio(modulo?: PricingModule | null): EstadoFormularioModuloPrecio {
  return {
    spaceId: modulo?.spaceId || modulo?.space?.id || '',
    name: modulo?.name || '',
    description: modulo?.description || '',
    moduleType: modulo?.moduleType || 'CONTINUOUS_BLOCK',
    durationHours: modulo?.durationHours ? String(modulo.durationHours) : '',
    weeklyHours: modulo?.weeklyHours ? String(modulo.weeklyHours) : '',
    pricePerHour: modulo?.pricePerHour ? String(Number(modulo.pricePerHour)) : '',
    sortOrder: modulo?.sortOrder !== undefined ? String(modulo.sortOrder) : '0',
    isActive: modulo?.isActive ?? true,
  };
}

export function obtenerHorasFacturables(estado: EstadoFormularioModuloPrecio) {
  if (estado.moduleType === 'WEEKLY_PACK') return Number(estado.weeklyHours || 0);
  return Number(estado.durationHours || 0);
}

export function calcularTotalModuloPrecio(estado: EstadoFormularioModuloPrecio) {
  return obtenerHorasFacturables(estado) * Number(estado.pricePerHour || 0);
}

export function construirPayloadModuloPrecio(estado: EstadoFormularioModuloPrecio): PricingModulePayload {
  const durationHours = estado.durationHours ? Number(estado.durationHours) : null;
  const weeklyHours = estado.moduleType === 'WEEKLY_PACK' && estado.weeklyHours ? Number(estado.weeklyHours) : null;

  return {
    spaceId: estado.spaceId,
    name: estado.name.trim(),
    description: estado.description.trim() || null,
    moduleType: estado.moduleType,
    durationHours,
    weeklyHours,
    pricePerHour: Number(estado.pricePerHour || 0),
    totalPrice: calcularTotalModuloPrecio(estado),
    sortOrder: Number(estado.sortOrder || 0),
    isActive: estado.isActive,
  };
}

export function validarFormularioModuloPrecio(estado: EstadoFormularioModuloPrecio) {
  if (!estado.spaceId) return 'Seleccioná el espacio al que pertenece el módulo.';
  if (!estado.name.trim()) return 'Ingresá el nombre del módulo.';
  if (!Number(estado.pricePerHour || 0)) return 'Ingresá el precio por hora.';
  if (estado.moduleType === 'WEEKLY_PACK' && !Number(estado.weeklyHours || 0)) return 'Ingresá las horas semanales del pack.';
  if (estado.moduleType !== 'WEEKLY_PACK' && !Number(estado.durationHours || 0)) return 'Ingresá la duración del módulo.';
  return null;
}

export function etiquetaTipoModuloPrecio(tipo?: PricingModuleType | string | null) {
  return TIPOS_MODULO_PRECIO.find((item) => item.value === tipo)?.label || 'Módulo';
}

export function detalleDuracionModulo(modulo: PricingModule) {
  if (modulo.moduleType === 'WEEKLY_PACK') {
    const horasBloque = modulo.durationHours || 4;
    return `${modulo.weeklyHours || 0} horas semanales · ${Math.round((modulo.weeklyHours || 0) / horasBloque)} bloques de ${horasBloque} horas`;
  }

  if ((modulo.durationHours || 0) === 1) return '1 hora';
  return `${modulo.durationHours || 0} horas`;
}
