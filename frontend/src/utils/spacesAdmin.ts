import { Amenity, Space, SpaceAmenity, SpacePayload } from '../types';

export type SpaceFormState = {
  name: string;
  slug: string;
  description: string;
  floor: string;
  address: string;
  capacity: string;
  baseHourlyPrice: string;
  recurrentHourlyPrice: string;
  amenityIds: string[];
  newAmenityName: string;
  newAmenityIcon: string;
  newAmenityCategory: string;
  isActive: boolean;
};

export function createEmptySpaceFormState(): SpaceFormState {
  return {
    name: '',
    slug: '',
    description: '',
    floor: '',
    address: 'Rivadavia 3174, Mar del Plata, Buenos Aires',
    capacity: '',
    baseHourlyPrice: '7500',
    recurrentHourlyPrice: '',
    amenityIds: [],
    newAmenityName: '',
    newAmenityIcon: 'check_circle',
    newAmenityCategory: 'General',
    isActive: true,
  };
}

export function createSpaceFormState(space: Space): SpaceFormState {
  return {
    name: space.name,
    slug: space.slug,
    description: space.description || '',
    floor: space.floor || '',
    address: space.address || '',
    capacity: space.capacity ? String(space.capacity) : '',
    baseHourlyPrice: String(space.baseHourlyPrice || ''),
    recurrentHourlyPrice: space.recurrentHourlyPrice ? String(space.recurrentHourlyPrice) : '',
    amenityIds: getSpaceAmenityIds(space),
    newAmenityName: '',
    newAmenityIcon: 'check_circle',
    newAmenityCategory: 'General',
    isActive: space.isActive,
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

export function buildSpacePayload(state: SpaceFormState): SpacePayload {
  return {
    name: state.name.trim(),
    slug: state.slug.trim() || undefined,
    description: state.description.trim() || null,
    floor: state.floor.trim() || null,
    address: state.address.trim() || null,
    capacity: toOptionalNumber(state.capacity),
    baseHourlyPrice: toNumber(state.baseHourlyPrice),
    recurrentHourlyPrice: toOptionalNumber(state.recurrentHourlyPrice),
    amenityIds: state.amenityIds,
    isActive: state.isActive,
  };
}

export function getSpaceLocation(space: Pick<Space, 'floor' | 'address'>) {
  return [space.floor, space.address].filter(Boolean).join(' · ') || 'Sin ubicación cargada';
}

export function getSpaceAmenityName(spaceAmenity: SpaceAmenity) {
  return spaceAmenity.amenity?.name || spaceAmenity.name || 'Servicio sin nombre';
}

export function getSpaceAmenityIcon(spaceAmenity: SpaceAmenity) {
  return spaceAmenity.amenity?.icon || spaceAmenity.icon || 'check_circle';
}

export function getSpaceAmenityIds(space: Space) {
  return Array.from(new Set((space.amenities || []).map((item) => item.amenityId).filter(Boolean))) as string[];
}

export function getAmenitiesLabel(space: Space) {
  if (!space.amenities?.length) return 'Sin servicios cargados';
  return space.amenities.map(getSpaceAmenityName).join(' · ');
}

export function sortAmenities(amenities: Amenity[]) {
  return [...amenities].sort((first, second) => first.sortOrder - second.sortOrder || first.name.localeCompare(second.name));
}
