import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Booking, PricingModule, SessionMode, Space, SpaceAvailabilityCalendar, User } from '../types';
import {
  SelectedRange,
  buildAggregateSelection,
  hasSlotOverlap,
  isSameCalendarDay,
  slotKey,
} from '../utils/calendar';
import {
  getPricingModulesForSpace,
  isWeeklyPack,
  moduleBlockHours,
  moduleRequiredBlocks,
} from '../utils/pricingModules';

type UseBookingCalendarParams = {
  mode: SessionMode;
  user?: User;
  spaces: Space[];
  pricingModules: PricingModule[];
  preferredSpaceId?: string;
  onSignIn?: () => void;
  onBookingCreated?: (booking: Booking) => void;
  onSpaceSelected?: (spaceId: string) => void;
};

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function isTodayDate(value: string) {
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  return toDateOnly(date) === toDateOnly(new Date());
}

function hasAvailableSlotToday(day: SpaceAvailabilityCalendar['days'][number]) {
  return day.slots.some((slot) => slot.status === 'AVAILABLE');
}

function removeTodayWhenFullyUnavailable(calendars: SpaceAvailabilityCalendar[]) {
  return calendars.map((calendar) => ({
    ...calendar,
    days: calendar.days.filter((day) => !isTodayDate(day.date) || hasAvailableSlotToday(day)),
  }));
}

function resolveInitialSpaceId(spaces: Space[], preferredSpaceId?: string) {
  if (!spaces.length) return '';
  if (preferredSpaceId && spaces.some((space) => space.id === preferredSpaceId)) return preferredSpaceId;
  return spaces[0].id;
}

function rangeDate(range: SelectedRange) {
  return range.startAt.slice(0, 10);
}

function buildSelection(spaceId: string, ranges: SelectedRange[]) {
  return buildAggregateSelection(spaceId, ranges);
}

function buildBlockNote(blocks: SelectedRange[]) {
  return blocks
    .map((block, index) => `Bloque ${index + 1}: ${block.startAt} a ${block.endAt}`)
    .join(' | ');
}

export function useBookingCalendar({
  mode,
  user,
  spaces,
  pricingModules,
  preferredSpaceId,
  onSignIn,
  onBookingCreated,
  onSpaceSelected,
}: UseBookingCalendarParams) {
  const [spaceId, setInternalSpaceId] = useState(() => resolveInitialSpaceId(spaces, preferredSpaceId));
  const [moduleId, setModuleId] = useState('');
  const [calendars, setCalendars] = useState<SpaceAvailabilityCalendar[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<SelectedRange[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  function resetSelection() {
    setSelectedBlocks([]);
    setMessage(null);
  }

  function setSpaceId(nextSpaceId: string) {
    if (!nextSpaceId || nextSpaceId === spaceId) return;
    resetSelection();
    setInternalSpaceId(nextSpaceId);
    onSpaceSelected?.(nextSpaceId);
  }

  function setPricingModuleId(nextModuleId: string) {
    if (!nextModuleId || nextModuleId === moduleId) return;
    resetSelection();
    setModuleId(nextModuleId);
  }

  useEffect(() => {
    if (!spaces.length) {
      setInternalSpaceId('');
      return;
    }

    const nextSpaceId = resolveInitialSpaceId(spaces, preferredSpaceId);
    const currentSpaceStillExists = spaces.some((space) => space.id === spaceId);

    if (!spaceId || !currentSpaceStillExists || (preferredSpaceId && preferredSpaceId !== spaceId)) {
      resetSelection();
      setInternalSpaceId(nextSpaceId);
      onSpaceSelected?.(nextSpaceId);
    }
  }, [spaces, preferredSpaceId, spaceId, onSpaceSelected]);

  const availablePricingModules = useMemo(
    () => getPricingModulesForSpace(pricingModules, spaceId),
    [pricingModules, spaceId],
  );

  useEffect(() => {
    if (!availablePricingModules.length) {
      setModuleId('');
      resetSelection();
      return;
    }
    const currentModuleStillExists = availablePricingModules.some((module) => module.id === moduleId);
    if (!moduleId || !currentModuleStillExists) {
      resetSelection();
      setModuleId(availablePricingModules[0].id);
    }
  }, [availablePricingModules, moduleId]);

  const refreshCalendar = async () => {
    if (!spaceId) return;
    resetSelection();
    setIsLoadingCalendar(true);

    try {
      const response = removeTodayWhenFullyUnavailable(await api.getAvailabilitySlots({ spaceId, days: 7 }));
      if (!response.length || !response[0]?.days?.length) {
        setCalendars([]);
        setMessage('No se encontró disponibilidad para este espacio. Revisá las reglas de disponibilidad.');
        return;
      }
      setCalendars(response);
    } catch {
      setCalendars([]);
      setMessage('No pude conectar con el servidor. Intentá nuevamente en unos minutos.');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!spaceId) return;

    resetSelection();
    setIsLoadingCalendar(true);

    api.getAvailabilitySlots({ spaceId, days: 7 })
      .then((response) => {
        if (cancelled) return;
        const normalizedResponse = removeTodayWhenFullyUnavailable(response);
        if (!normalizedResponse.length || !normalizedResponse[0]?.days?.length) {
          setCalendars([]);
          setMessage('No se encontró disponibilidad para este espacio. Revisá las reglas de disponibilidad.');
          return;
        }
        setCalendars(normalizedResponse);
      })
      .catch(() => {
        if (cancelled) return;
        setCalendars([]);
        setMessage('No pude conectar con el servidor. Intentá nuevamente en unos minutos.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCalendar(false);
      });

    return () => {
      cancelled = true;
    };
  }, [spaceId]);

  const selectedModule = availablePricingModules.find((item) => item.id === moduleId) || availablePricingModules[0];
  const currentCalendar = calendars.find((item) => item.spaceId === spaceId) || calendars[0];
  const selectedSpace = spaces.find((space) => space.id === spaceId);
  const requiredBlocks = moduleRequiredBlocks(selectedModule);
  const blockHours = moduleBlockHours(selectedModule);
  const isWeekly = isWeeklyPack(selectedModule);
  const selected = buildSelection(spaceId, selectedBlocks);
  const isSelectionComplete = selectedBlocks.length === requiredBlocks;

  function selectSlot(dayIndex: number, slotIndex: number) {
    if (!selectedModule || !currentCalendar) return;

    const day = currentCalendar.days[dayIndex];
    const range = day.slots.slice(slotIndex, slotIndex + blockHours);
    const canSelect = range.length === blockHours && range.every((slot) => slot.status === 'AVAILABLE');

    if (!canSelect) {
      setMessage(`Ese bloque no tiene ${blockHours} horas disponibles completas. Elegí otro horario.`);
      return;
    }

    const nextBlock: SelectedRange = {
      spaceId: currentCalendar.spaceId,
      startAt: range[0].startAt,
      endAt: range[range.length - 1].endAt,
      slotKeys: range.map(slotKey),
    };

    if (!isWeekly) {
      const clickedSelectedBlock = selectedBlocks.find((block) => hasSlotOverlap(block, nextBlock));
      setMessage(null);
      setSelectedBlocks(clickedSelectedBlock ? [] : [nextBlock]);
      return;
    }

    setSelectedBlocks((currentBlocks) => {
      const clickedSelectedBlock = currentBlocks.find((block) => hasSlotOverlap(block, nextBlock));
      if (clickedSelectedBlock) {
        setMessage(null);
        return currentBlocks.filter((block) => block !== clickedSelectedBlock);
      }

      const sameDayIndex = currentBlocks.findIndex((block) => isSameCalendarDay(block.startAt, nextBlock.startAt));
      if (sameDayIndex >= 0) {
        const nextBlocks = [...currentBlocks];
        nextBlocks[sameDayIndex] = nextBlock;
        setMessage('Actualicé el bloque de ese día. El pack requiere dos días distintos.');
        return nextBlocks.sort((a, b) => a.startAt.localeCompare(b.startAt));
      }

      if (currentBlocks.length >= requiredBlocks) {
        setMessage(`Ya seleccionaste los ${requiredBlocks} bloques del pack. Tocá un bloque seleccionado para quitarlo o cambiarlo.`);
        return currentBlocks;
      }

      const nextBlocks = [...currentBlocks, nextBlock].sort((a, b) => a.startAt.localeCompare(b.startAt));
      if (nextBlocks.length < requiredBlocks) {
        setMessage(`Seleccioná ${requiredBlocks - nextBlocks.length} bloque más de ${blockHours} horas en otro día.`);
      } else {
        setMessage(null);
      }
      return nextBlocks;
    });
  }

  async function createBooking() {
    if (mode === 'public') {
      onSignIn?.();
      return;
    }

    if (!selectedModule || !selectedBlocks.length) {
      setMessage('Primero seleccioná un horario disponible.');
      return;
    }

    if (!isSelectionComplete) {
      setMessage(`Este pack requiere ${requiredBlocks} bloques de ${blockHours} horas en días distintos.`);
      return;
    }

    try {
      if (isWeekly) {
        const bookings = await api.createWeeklyPack({
          spaceId,
          userId: user?.id,
          professionalProfileId: user?.professionalProfile?.id,
          pricingModuleId: selectedModule.id,
          status: mode === 'admin' ? 'CONFIRMED' : 'PENDING',
          blocks: selectedBlocks.map((block) => ({ startAt: block.startAt, endAt: block.endAt })),
          notes: `${mode === 'admin' ? 'Pack semanal creado desde calendario admin.' : 'Pack semanal solicitado desde calendario web.'} ${buildBlockNote(selectedBlocks)}`,
        });

        setMessage(mode === 'admin' ? 'Pack semanal creado correctamente.' : 'Pack semanal solicitado. Queda pendiente de confirmación/pago.');
        setSelectedBlocks([]);
        if (bookings[0]) onBookingCreated?.(bookings[0]);
        await refreshCalendar();
        return;
      }

      const selectedBlock = selectedBlocks[0];
      const booking = await api.createBooking({
        spaceId: selectedBlock.spaceId,
        userId: user?.id,
        professionalProfileId: user?.professionalProfile?.id,
        pricingModuleId: selectedModule.id,
        startAt: selectedBlock.startAt,
        endAt: selectedBlock.endAt,
        status: mode === 'admin' ? 'CONFIRMED' : 'PENDING',
        bookingType: mode === 'admin' ? 'INTERNAL_USE' : 'ONE_TIME',
        notes: mode === 'admin' ? 'Creado desde calendario admin.' : 'Reserva solicitada desde calendario web.',
      });

      setMessage(mode === 'admin' ? 'Reserva creada correctamente.' : 'Reserva solicitada. Queda pendiente de confirmación/pago.');
      setSelectedBlocks([]);
      onBookingCreated?.(booking);
      await refreshCalendar();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear la reserva.');
    }
  }

  return {
    spaceId,
    setSpaceId,
    moduleId,
    setModuleId: setPricingModuleId,
    selected,
    selectedBlocks,
    selectedModule,
    selectedSpace,
    currentCalendar,
    availablePricingModules,
    message,
    isLoadingCalendar,
    isWeekly,
    requiredBlocks,
    blockHours,
    isSelectionComplete,
    refreshCalendar,
    selectSlot,
    createBooking,
  };
}
