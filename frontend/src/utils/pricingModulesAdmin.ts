import { PricingModule, PricingModulePayload, PricingModuleType } from '../types';

export type PricingModuleFormState = {
  spaceId: string;
  name: string;
  slug: string;
  description: string;
  moduleType: PricingModuleType;
  durationHours: string;
  weeklyHours: string;
  pricePerHour: string;
  totalPrice: string;
  sortOrder: string;
  isActive: boolean;
};

export const pricingModuleTypeOptions: Array<{ value: PricingModuleType; label: string; description: string }> = [
  {
    value: 'SINGLE',
    label: 'Hora simple',
    description: 'Reserva puntual de una hora.',
  },
  {
    value: 'CONTINUOUS_BLOCK',
    label: 'Bloque corrido',
    description: 'Varias horas consecutivas en el mismo día.',
  },
  {
    value: 'WEEKLY_PACK',
    label: 'Pack semanal',
    description: 'Horas semanales distribuidas en bloques.',
  },
];

export function getPricingModuleTypeLabel(type: PricingModuleType) {
  return pricingModuleTypeOptions.find((option) => option.value === type)?.label || type;
}

export function getPricingModuleDurationDetail(module: Pick<PricingModule, 'moduleType' | 'durationHours' | 'weeklyHours'>) {
  if (module.moduleType === 'WEEKLY_PACK') {
    return `${module.weeklyHours || 0} horas semanales`;
  }

  const hours = module.durationHours || 0;
  return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
}

export function createEmptyPricingModuleFormState(spaceId = ''): PricingModuleFormState {
  return {
    spaceId,
    name: '',
    slug: '',
    description: '',
    moduleType: 'CONTINUOUS_BLOCK',
    durationHours: '1',
    weeklyHours: '',
    pricePerHour: '7500',
    totalPrice: '',
    sortOrder: '0',
    isActive: true,
  };
}

export function createPricingModuleFormState(module: PricingModule): PricingModuleFormState {
  return {
    spaceId: module.spaceId || '',
    name: module.name,
    slug: module.slug || '',
    description: module.description || '',
    moduleType: module.moduleType,
    durationHours: module.durationHours ? String(module.durationHours) : '',
    weeklyHours: module.weeklyHours ? String(module.weeklyHours) : '',
    pricePerHour: String(module.pricePerHour || ''),
    totalPrice: String(module.totalPrice || ''),
    sortOrder: String(module.sortOrder ?? 0),
    isActive: module.isActive,
  };
}

function toOptionalNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildPricingModulePayload(state: PricingModuleFormState): PricingModulePayload {
  const durationHours = toOptionalNumber(state.durationHours);
  const weeklyHours = toOptionalNumber(state.weeklyHours);
  const pricePerHour = toNumber(state.pricePerHour);
  const totalPrice = toOptionalNumber(state.totalPrice);

  return {
    spaceId: state.spaceId,
    name: state.name.trim(),
    slug: state.slug.trim() || undefined,
    description: state.description.trim() || null,
    moduleType: state.moduleType,
    durationHours: state.moduleType === 'WEEKLY_PACK' ? durationHours || 4 : durationHours,
    weeklyHours: state.moduleType === 'WEEKLY_PACK' ? weeklyHours : null,
    pricePerHour,
    totalPrice: totalPrice || undefined,
    sortOrder: Math.trunc(toNumber(state.sortOrder)),
    isActive: state.isActive,
  };
}

export function calculatePricingModuleTotal(state: PricingModuleFormState) {
  const explicitTotal = toOptionalNumber(state.totalPrice);
  if (explicitTotal && explicitTotal > 0) return explicitTotal;

  const pricePerHour = toNumber(state.pricePerHour);
  const hours = state.moduleType === 'WEEKLY_PACK'
    ? toOptionalNumber(state.weeklyHours)
    : toOptionalNumber(state.durationHours);

  return Number(hours || 0) * pricePerHour;
}
