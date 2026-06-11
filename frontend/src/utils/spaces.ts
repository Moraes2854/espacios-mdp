import { Space } from '../types';

export function spaceCoverUrl(space?: Space) {
  if (!space) return null;
  return space.images?.find((image) => image.isCover)?.url || space.images?.[0]?.url || null;
}

export function spaceLocationLabel(space?: Space) {
  if (!space) return 'Ubicación pendiente';
  return [space.address, space.floor].filter(Boolean).join(' · ') || 'Ubicación pendiente';
}

export function compactSpaceLocation(space?: Space) {
  if (!space) return 'Mar del Plata';
  const address = space.address?.replace(', Buenos Aires', '').replace(', Argentina', '').trim();
  return [address, space.floor].filter(Boolean).join(' · ') || space.name;
}

function officeNumberFrom(space: Space) {
  const source = [space.floor, space.name].filter(Boolean).join(' ');
  const match = source.match(/oficina\s*(\d+)|of\.\s*(\d+)/i);
  return match?.[1] || match?.[2] || null;
}

function floorNumberFrom(space: Space) {
  const source = [space.floor, space.name].filter(Boolean).join(' ');
  return source.match(/piso\s*(\d+)/i)?.[1] || null;
}

export function spaceShortName(space?: Space) {
  if (!space) return 'Espacio';

  const officeNumber = officeNumberFrom(space);
  const floorNumber = floorNumberFrom(space);

  if (officeNumber && floorNumber) return `Piso ${floorNumber} Oficina ${officeNumber}`;
  if (officeNumber) return `Oficina ${officeNumber}`;

  return space.name
    .replace(/oficina\s*\/\s*consultorio\s*privado\s*-?\s*/i, '')
    .replace(/consultorio\s*\/\s*oficina\s*privado\s*-?\s*/i, '')
    .trim() || space.name;
}
