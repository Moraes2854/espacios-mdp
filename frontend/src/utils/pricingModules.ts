import { PricingModule } from '../types';
import { formatMoney } from './formatters';

export function isWeeklyPack(module?: PricingModule) {
  return module?.moduleType === 'WEEKLY_PACK';
}

export function moduleHours(module?: PricingModule) {
  if (!module) return 1;
  return module.durationHours || module.weeklyHours || 1;
}

export function moduleTotalHours(module?: PricingModule) {
  return module?.weeklyHours || module?.durationHours || 1;
}

export function moduleBlockHours(module?: PricingModule) {
  if (!module) return 1;
  if (isWeeklyPack(module)) return module.durationHours || 4;
  return module.durationHours || 1;
}

export function moduleRequiredBlocks(module?: PricingModule) {
  if (!module) return 1;
  if (!isWeeklyPack(module)) return 1;

  const totalHours = module.weeklyHours || module.durationHours || 1;
  const blockHours = moduleBlockHours(module);
  return Math.max(1, Math.ceil(totalHours / blockHours));
}

export function moduleDisplayName(module?: PricingModule) {
  if (!module) return 'Módulo';
  if (isWeeklyPack(module)) return `${module.weeklyHours || module.durationHours || 0} horas semanales`;
  if ((module.durationHours || 0) === 1) return '1 hora';
  return `${module.durationHours} horas`;
}

export function moduleShortName(module?: PricingModule) {
  if (!module) return '-';
  if (isWeeklyPack(module)) return `${module.weeklyHours || module.durationHours || 0} hs semanales`;
  return `${moduleHours(module)} h`;
}

export function moduleSecondaryLabel(module?: PricingModule) {
  if (!module) return '';
  if (isWeeklyPack(module)) {
    const blocks = moduleRequiredBlocks(module);
    const blockHours = moduleBlockHours(module);
    return `${blocks} bloques de ${blockHours} h en días distintos`;
  }
  if (moduleHours(module) === 1) return 'Reserva puntual';
  return `Bloque de ${moduleHours(module)} h`;
}

export function moduleDetail(module?: PricingModule) {
  if (!module) return 'Elegí un módulo para calcular la reserva.';
  const unitPrice = `${formatMoney(module.pricePerHour)} por hora`;
  if (isWeeklyPack(module)) {
    return `${moduleSecondaryLabel(module)} · ${unitPrice} · Total ${formatMoney(module.totalPrice)}`;
  }
  return `${moduleDisplayName(module)} · ${unitPrice} · Total ${formatMoney(module.totalPrice)}`;
}

export function moduleOptionLabel(module: PricingModule) {
  return `${moduleDisplayName(module)} — ${formatMoney(module.totalPrice)}`;
}

export function isBestHourlyRate(module?: PricingModule) {
  return Number(module?.pricePerHour || 0) === 5500;
}

export function moduleBadge(module: PricingModule) {
  if (isBestHourlyRate(module)) return 'Mejor precio por hora';
  if (isWeeklyPack(module)) return 'Pack semanal';
  return '';
}

export function moduleSavingsLabel(module: PricingModule) {
  const total = Number(module.totalPrice || 0);
  const perHour = Number(module.pricePerHour || 0);
  const hours = moduleTotalHours(module);
  if (!total || !perHour || !hours) return null;
  return `${formatMoney(perHour)} por hora`;
}

export function getPricingModulesForSpace(pricingModules: PricingModule[], spaceId: string) {
  return pricingModules
    .filter((module) => module.isActive && (!module.spaceId || module.spaceId === spaceId))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}
