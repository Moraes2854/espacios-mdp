import { Amenity, AmenityPayload } from '../types';

export type AmenityFormState = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  category: string;
  sortOrder: string;
  isActive: boolean;
};

export function createEmptyAmenityFormState(): AmenityFormState {
  return {
    name: '',
    slug: '',
    icon: 'check_circle',
    description: '',
    category: 'General',
    sortOrder: '0',
    isActive: true,
  };
}

export function createAmenityFormState(amenity: Amenity): AmenityFormState {
  return {
    name: amenity.name,
    slug: amenity.slug,
    icon: amenity.icon || 'check_circle',
    description: amenity.description || '',
    category: amenity.category || 'General',
    sortOrder: String(amenity.sortOrder ?? 0),
    isActive: amenity.isActive,
  };
}

export function buildAmenityPayload(state: AmenityFormState): AmenityPayload {
  return {
    name: state.name.trim(),
    slug: state.slug.trim() || undefined,
    icon: state.icon.trim() || 'check_circle',
    description: state.description.trim() || null,
    category: state.category.trim() || null,
    sortOrder: Number(state.sortOrder || 0),
    isActive: state.isActive,
  };
}
