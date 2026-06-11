import { CalendarDays, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDay, CalendarSlot, PricingModule, SessionMode, Space } from '../../types';
import { isSlotSelected, SelectedRange } from '../../utils/calendar';
import { formatDurationHours, formatLongDate, formatMoney, formatTime } from '../../utils/formatters';
import { isBestHourlyRate, moduleDisplayName } from '../../utils/pricingModules';
import { compactSpaceLocation, spaceCoverUrl, spaceShortName } from '../../utils/spaces';
import { PaymentActions } from './PaymentActions';

type MobileBookingFlowProps = {
  mode: SessionMode;
  spaces: Space[];
  selectedSpace?: Space;
  selectedSpaceId: string;
  pricingModules: PricingModule[];
  selectedModule?: PricingModule;
  selectedModuleId: string;
  days: CalendarDay[];
  selected: SelectedRange | null;
  selectedBlocks: SelectedRange[];
  requiredBlocks: number;
  blockHours: number;
  isWeekly: boolean;
  isSelectionComplete: boolean;
  onSpaceChange: (spaceId: string) => void;
  onModuleChange: (moduleId: string) => void;
  onSlotClick: (dayIndex: number, slotIndex: number) => void;
  onCreateBooking: () => void;
};

type DayParts = {
  weekday: string;
  dayNumber: string;
  month: string;
};

function toLocalDate(value: string) {
  return new Date(value.includes('T') ? value : `${value}T00:00:00`);
}

function dayParts(day: CalendarDay): DayParts {
  const date = toLocalDate(day.date);
  return {
    weekday: new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(date).replace('.', ''),
    dayNumber: new Intl.DateTimeFormat('es-AR', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(date),
  };
}

function monthLabel(day?: CalendarDay) {
  if (!day) return '';
  const parts = dayParts(day);
  return parts.month.charAt(0).toUpperCase() + parts.month.slice(1);
}

function firstSelectableDayIndex(days: CalendarDay[]) {
  const withAvailability = days.findIndex((day) => !day.isClosed && day.slots.some((slot) => slot.status === 'AVAILABLE'));
  if (withAvailability >= 0) return withAvailability;
  const open = days.findIndex((day) => !day.isClosed);
  return open >= 0 ? open : 0;
}

function isDayDisabled(day: CalendarDay) {
  return day.isClosed || !day.slots.length;
}

function slotStatusLabel(slot: CalendarSlot, selected: SelectedRange | null) {
  if (isSlotSelected(slot, selected)) return 'Seleccionado';
  if (slot.status === 'AVAILABLE') return 'Disponible';
  if (slot.status === 'BOOKED') return 'Ocupado';
  if (slot.status === 'BLOCKED') return slot.blockReason || 'Bloqueado';
  return 'Pasado';
}

function slotClass(slot: CalendarSlot, selected: SelectedRange | null) {
  const selectedClass = isSlotSelected(slot, selected) ? ' is-selected' : '';
  return `mobile-time-slot mobile-time-slot--${slot.status.toLowerCase()}${selectedClass}`;
}

function selectedTicketSubtitle(selectedBlocks: SelectedRange[], isWeekly: boolean, requiredBlocks: number, blockHours: number) {
  if (!selectedBlocks.length) return 'Elegí un horario disponible';
  if (isWeekly) return `${selectedBlocks.length}/${requiredBlocks} bloques de ${blockHours} horas`;

  const block = selectedBlocks[0];
  return `${formatLongDate(block.startAt)} • ${formatTime(block.startAt)} (${formatDurationHours(block.startAt, block.endAt)})`;
}

function selectionStatusText(isWeekly: boolean, selectedBlocks: SelectedRange[], requiredBlocks: number, blockHours: number) {
  if (!isWeekly) return null;
  if (selectedBlocks.length >= requiredBlocks) return 'Pack completo';
  const remaining = requiredBlocks - selectedBlocks.length;
  return `Falta ${remaining} bloque${remaining === 1 ? '' : 's'} de ${blockHours} horas`;
}



function buildMercadoPagoReference(selectedSpace?: Space, selectedModule?: PricingModule, selectedBlocks: SelectedRange[] = []) {
  const blockKey = selectedBlocks.map((block) => `${block.startAt}_${block.endAt}`).join('__') || 'sin-horario';
  return `espacios-mdp:${selectedSpace?.id || 'space'}:${selectedModule?.id || 'module'}:${blockKey}`;
}

function buildMercadoPagoDescription(selectedBlocks: SelectedRange[], isWeekly: boolean) {
  if (!selectedBlocks.length) return 'Reserva de espacio profesional';
  if (isWeekly) {
    return selectedBlocks
      .map((block, index) => `Bloque ${index + 1}: ${formatLongDate(block.startAt)} de ${formatTime(block.startAt)} a ${formatTime(block.endAt)}`)
      .join(' | ');
  }
  const block = selectedBlocks[0];
  return `${formatLongDate(block.startAt)} de ${formatTime(block.startAt)} a ${formatTime(block.endAt)}`;
}

function buildMercadoPagoPreference(
  selectedSpace: Space | undefined,
  selectedModule: PricingModule | undefined,
  selectedBlocks: SelectedRange[],
  isWeekly: boolean,
) {
  if (!selectedSpace || !selectedModule || !selectedBlocks.length) return undefined;

  return {
    title: `Reserva ${spaceShortName(selectedSpace)} - ${moduleDisplayName(selectedModule)}`,
    amount: Number(selectedModule.totalPrice),
    description: buildMercadoPagoDescription(selectedBlocks, isWeekly),
    externalReference: buildMercadoPagoReference(selectedSpace, selectedModule, selectedBlocks),
    metadata: {
      spaceId: selectedSpace.id,
      pricingModuleId: selectedModule.id,
      blocks: selectedBlocks.map((block) => ({ startAt: block.startAt, endAt: block.endAt })),
    },
  };
}

function mobileWhatsappMessage(selectedSpace?: Space, selectedModule?: PricingModule) {
  const spaceName = selectedSpace?.name || 'un espacio profesional';
  const moduleName = selectedModule ? moduleDisplayName(selectedModule) : 'un módulo';
  return `Hola, quiero consultar por la reserva de ${spaceName} para ${moduleName}.`;
}

function mobileDisabledReason(isWeekly: boolean, requiredBlocks: number, blockHours: number) {
  if (isWeekly) return `Elegí ${requiredBlocks} bloques de ${blockHours} h`;
  return 'Elegí un horario';
}

export function MobileBookingFlow({
  mode,
  spaces,
  selectedSpace,
  selectedSpaceId,
  pricingModules,
  selectedModule,
  selectedModuleId,
  days,
  selected,
  selectedBlocks,
  requiredBlocks,
  blockHours,
  isWeekly,
  isSelectionComplete,
  onSpaceChange,
  onModuleChange,
  onSlotClick,
  onCreateBooking,
}: MobileBookingFlowProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(() => firstSelectableDayIndex(days));

  useEffect(() => {
    setActiveDayIndex((current) => {
      if (!days.length) return 0;
      if (current >= 0 && current < days.length) return current;
      return firstSelectableDayIndex(days);
    });
  }, [days]);

  useEffect(() => {
    if (!selected?.startAt || !days.length) return;
    const selectedDate = selected.startAt.slice(0, 10);
    const nextIndex = days.findIndex((day) => day.date.slice(0, 10) === selectedDate);
    if (nextIndex >= 0) setActiveDayIndex(nextIndex);
  }, [days, selected?.startAt]);

  const activeDay = days[activeDayIndex] || days[firstSelectableDayIndex(days)];
  const canReserve = Boolean(selectedSpace && selectedModule && selectedBlocks.length && isSelectionComplete);
  const coverUrls = useMemo(() => new Map(spaces.map((space) => [space.id, spaceCoverUrl(space)])), [spaces]);
  const selectedSpaceLabel = spaceShortName(selectedSpace);
  const mercadoPagoPreference = buildMercadoPagoPreference(selectedSpace, selectedModule, selectedBlocks, isWeekly);

  return (
    <div className={`mobile-booking-flow${selectedBlocks.length > 0 ? ' has-ticket' : ''}`} aria-label="Reservá en minutos">
      <section className="mobile-flow-step" aria-label="Seleccionar espacio">
        <div className="mobile-flow-step-title">
          <span>1</span>
          <h3>Seleccioná tu espacio</h3>
        </div>

        <div className="mobile-space-strip" role="list">
          {spaces.map((space) => {
            const isSelected = selectedSpaceId === space.id;
            const cover = coverUrls.get(space.id);

            return (
              <button
                key={space.id}
                type="button"
                className={`mobile-space-card${isSelected ? ' is-selected' : ''}`}
                onClick={() => onSpaceChange(space.id)}
                aria-pressed={isSelected}
              >
                <span className="mobile-space-image" aria-hidden="true">
                  {cover ? <img src={cover} alt="" /> : <ImageIcon size={22} />}
                </span>
                <span className="mobile-space-copy">
                  <strong>{spaceShortName(space)}</strong>
                  <small>{compactSpaceLocation(space)}</small>
                  <em>Desde {formatMoney(space.baseHourlyPrice)} / h</em>
                </span>
                {isSelected && <CheckCircle className="mobile-space-check" size={24} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mobile-flow-step" aria-label="Elegir duración">
        <div className="mobile-flow-step-title">
          <span>2</span>
          <h3>Elegí la duración</h3>
        </div>

        <div className="mobile-duration-grid" role="list">
          {pricingModules.map((module) => {
            const isSelected = selectedModuleId === module.id;
            const bestRate = isBestHourlyRate(module);

            return (
              <button
                key={module.id}
                type="button"
                className={`mobile-duration-card${isSelected ? ' is-selected' : ''}${bestRate ? ' has-best-rate' : ''}`}
                onClick={() => onModuleChange(module.id)}
                aria-pressed={isSelected}
              >
                {bestRate && <span className="mobile-best-price-badge">Mejor precio</span>}
                <strong>{moduleDisplayName(module)}</strong>
                <em>{formatMoney(module.totalPrice)}</em>
                <small>{formatMoney(module.pricePerHour)} / h</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mobile-flow-step" aria-label="Seleccionar horarios">
        <div className="mobile-flow-step-title mobile-flow-step-title-between">
          <div>
            <span>3</span>
            <h3>Horarios</h3>
          </div>
          {activeDay && (
            <small>
              <CalendarDays size={18} /> {monthLabel(activeDay)}
            </small>
          )}
        </div>

        <div className="mobile-day-picker" role="tablist" aria-label="Días disponibles">
          {days.map((day, index) => {
            const parts = dayParts(day);
            const isActive = index === activeDayIndex;
            const isDisabled = isDayDisabled(day);

            return (
              <button
                key={day.date}
                type="button"
                className={`mobile-day-button${isActive ? ' is-active' : ''}${isDisabled ? ' is-disabled' : ''}`}
                onClick={() => !isDisabled && setActiveDayIndex(index)}
                disabled={isDisabled}
                role="tab"
                aria-selected={isActive}
              >
                <span>{parts.weekday}</span>
                <strong>{parts.dayNumber}</strong>
              </button>
            );
          })}
        </div>

        {activeDay ? (
          <div className="mobile-time-list" aria-label={`Horarios para ${activeDay.date}`}>
            {activeDay.isClosed ? (
              <div className="mobile-closed-day">Día cerrado</div>
            ) : (
              activeDay.slots.map((slot, slotIndex) => {
                const label = slotStatusLabel(slot, selected);
                const disabled = slot.status !== 'AVAILABLE';

                return (
                  <div className="mobile-time-row" key={slot.startAt}>
                    <span className="mobile-time-label">{slot.label}</span>
                    <button
                      type="button"
                      className={slotClass(slot, selected)}
                      disabled={disabled}
                      onClick={() => onSlotClick(activeDayIndex, slotIndex)}
                      aria-label={`${slot.label}: ${label}`}
                    >
                      <span>{label}</span>
                      {isSlotSelected(slot, selected) && <CheckCircle size={22} />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="mobile-closed-day">No hay días disponibles para mostrar.</div>
        )}
      </section>

      {selectedBlocks.length > 0 && selectedModule && selectedSpace && (
        <aside className="mobile-booking-ticket" aria-label="Resumen de reserva">
          <div className="mobile-ticket-summary">
            <div>
              <strong>{selectedSpaceLabel}</strong>
              <span>{selectedTicketSubtitle(selectedBlocks, isWeekly, requiredBlocks, blockHours)}</span>
              {selectionStatusText(isWeekly, selectedBlocks, requiredBlocks, blockHours) && (
                <small>{selectionStatusText(isWeekly, selectedBlocks, requiredBlocks, blockHours)}</small>
              )}
            </div>
            <div>
              <span>Total a pagar</span>
              <strong>{formatMoney(selectedModule.totalPrice)}</strong>
            </div>
          </div>

          <PaymentActions
            mode={mode}
            canContinue={canReserve}
            disabledReason={mobileDisabledReason(isWeekly, requiredBlocks, blockHours)}
            onPrimaryAction={onCreateBooking}
            whatsappMessage={mobileWhatsappMessage(selectedSpace, selectedModule)}
            mercadoPagoPreference={mercadoPagoPreference}
            compact
          />
        </aside>
      )}
    </div>
  );
}
