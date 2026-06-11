import { CalendarDay, CalendarSlot } from '../types';

export type SelectedRange = {
  spaceId: string;
  startAt: string;
  endAt: string;
  slotKeys: string[];
};

export function slotKey(slot: CalendarSlot) {
  return slot.startAt;
}

export function isSlotSelected(slot: CalendarSlot, selected: SelectedRange | null) {
  return Boolean(selected?.slotKeys.includes(slotKey(slot)));
}

export function buildAggregateSelection(spaceId: string, blocks: SelectedRange[]): SelectedRange | null {
  if (!blocks.length) return null;

  const orderedBlocks = [...blocks].sort((a, b) => a.startAt.localeCompare(b.startAt));

  return {
    spaceId,
    startAt: orderedBlocks[0].startAt,
    endAt: orderedBlocks[orderedBlocks.length - 1].endAt,
    slotKeys: orderedBlocks.flatMap((block) => block.slotKeys),
  };
}

export function dateOnlyFromIso(value: string) {
  return value.slice(0, 10);
}

export function isSameCalendarDay(first: string, second: string) {
  return dateOnlyFromIso(first) === dateOnlyFromIso(second);
}

export function hasSlotOverlap(first: SelectedRange, second: SelectedRange) {
  const selectedKeys = new Set(first.slotKeys);
  return second.slotKeys.some((key) => selectedKeys.has(key));
}

export function uniqueTimeLabels(days: CalendarDay[]) {
  const labels = new Set<string>();
  days.forEach((day) => day.slots.forEach((slot) => labels.add(slot.label)));
  return Array.from(labels).sort();
}

export function findSlotByLabel(day: CalendarDay, label: string) {
  return day.slots.find((slot) => slot.label === label);
}

export function availableSlotCount(days: CalendarDay[]) {
  return days.reduce((total, day) => total + day.slots.filter((slot) => slot.status === 'AVAILABLE').length, 0);
}

export function dayAvailabilityLabel(day: CalendarDay) {
  if (day.isClosed) return 'Cerrado';
  const available = day.slots.filter((slot) => slot.status === 'AVAILABLE').length;
  if (!available) return 'Sin turnos';
  return `${available} libres`;
}
