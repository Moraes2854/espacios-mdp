import { CalendarDay, CalendarSlot } from '../../types';
import { dayAvailabilityLabel, findSlotByLabel, isSlotSelected, SelectedRange, uniqueTimeLabels } from '../../utils/calendar';
import { formatShortDate } from '../../utils/formatters';
import { CalendarLegend } from './CalendarLegend';

type CalendarGridProps = {
  days: CalendarDay[];
  selected: SelectedRange | null;
  onSlotClick: (dayIndex: number, slotIndex: number) => void;
};

type DayParts = {
  weekday: string;
  dayNumber: string;
  month: string;
  isToday: boolean;
};

function toLocalDate(value: string) {
  return new Date(value.includes('T') ? value : `${value}T00:00:00`);
}

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dayParts(day: CalendarDay): DayParts {
  const date = toLocalDate(day.date);
  const today = new Date();

  return {
    weekday: new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(date).replace('.', ''),
    dayNumber: new Intl.DateTimeFormat('es-AR', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date).replace('.', ''),
    isToday: dateOnly(date) === dateOnly(today),
  };
}

function slotTitle(slot?: CalendarSlot) {
  if (!slot) return 'Fuera de horario';
  if (slot.status === 'AVAILABLE') return 'Disponible';
  if (slot.status === 'BOOKED') return `Ocupado${slot.bookingStatus ? ` · ${slot.bookingStatus}` : ''}`;
  if (slot.status === 'BLOCKED') return slot.blockReason || 'Bloqueado';
  return 'Pasado';
}

function slotStatusClass(slot: CalendarSlot | undefined, selected: SelectedRange | null) {
  if (!slot) return 'availability-slot availability-slot--out';
  const selectedClass = isSlotSelected(slot, selected) ? ' is-selected' : '';
  return `availability-slot availability-slot--${slot.status.toLowerCase()}${selectedClass}`;
}

function isDisabled(slot?: CalendarSlot) {
  return !slot || slot.status !== 'AVAILABLE';
}

function weekRangeLabel(days: CalendarDay[]) {
  if (!days.length) return 'Semana';
  const first = formatShortDate(days[0].date);
  const last = formatShortDate(days[days.length - 1].date);
  return `Semana ${first} al ${last}`;
}

export function CalendarGrid({ days, selected, onSlotClick }: CalendarGridProps) {
  const labels = uniqueTimeLabels(days);

  if (!days.length) return null;

  return (
    <section className="availability-shell" aria-label="Calendario de disponibilidad">
      <div className="availability-week-title">
        <div>
          <span className="selector-step">3</span>
          <small>Calendario</small>
          <strong>{weekRangeLabel(days)}</strong>
        </div>
        <div className="availability-week-meta">
          <p>Elegí una hora libre. Si el módulo dura varias horas, se selecciona el rango corrido completo.</p>
          <CalendarLegend />
        </div>
      </div>

      <div className="availability-desktop-scroll">
        <div className="availability-grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(104px, 1fr))` }}>
          <div className="availability-corner">Hora</div>

          {days.map((day) => {
            const parts = dayParts(day);
            const closedClass = day.isClosed ? ' is-closed' : '';
            const todayClass = parts.isToday ? ' is-today' : '';

            return (
              <div className={`availability-day-head${closedClass}${todayClass}`} key={day.date}>
                <span>{parts.weekday}</span>
                <strong>{parts.dayNumber}</strong>
                <small>{parts.month} · {dayAvailabilityLabel(day)}</small>
              </div>
            );
          })}

          {labels.map((label) => (
            <div className="availability-row-fragment" key={label}>
              <div className="availability-time-cell">{label}</div>
              {days.map((day, dayIndex) => {
                const slot = findSlotByLabel(day, label);
                const slotIndex = slot ? day.slots.findIndex((item) => item.startAt === slot.startAt) : -1;
                const disabled = isDisabled(slot);
                const title = slotTitle(slot);

                return (
                  <button
                    key={`${day.date}-${label}`}
                    type="button"
                    className={slotStatusClass(slot, selected)}
                    disabled={disabled}
                    title={title}
                    aria-label={`${day.date} ${label}: ${title}`}
                    onClick={() => slotIndex >= 0 && onSlotClick(dayIndex, slotIndex)}
                  >
                    <span>{slot?.status === 'AVAILABLE' ? '' : title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="availability-mobile-list">
        {days.map((day, dayIndex) => {
          const parts = dayParts(day);

          return (
            <article className="availability-mobile-day" key={day.date}>
              <header>
                <div>
                  <span>{parts.weekday}</span>
                  <strong>{parts.dayNumber} {parts.month}</strong>
                </div>
                <small>{dayAvailabilityLabel(day)}</small>
              </header>

              {day.isClosed ? (
                <div className="closed-day">Cerrado</div>
              ) : (
                <div className="availability-mobile-slots">
                  {day.slots.map((slot, slotIndex) => {
                    const title = slotTitle(slot);

                    return (
                      <button
                        key={slot.startAt}
                        type="button"
                        className={slotStatusClass(slot, selected)}
                        disabled={slot.status !== 'AVAILABLE'}
                        title={title}
                        onClick={() => onSlotClick(dayIndex, slotIndex)}
                      >
                        <span>{slot.label}</span>
                        <small>{title}</small>
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
