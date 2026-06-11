import { RefreshCw } from 'lucide-react';
import { useBookingCalendar } from '../../hooks/useBookingCalendar';
import { Booking, PricingModule, SessionMode, Space, User } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';
import { CalendarFooter } from './CalendarFooter';
import { CalendarGrid } from './CalendarGrid';
import { CalendarToolbar } from './CalendarToolbar';
import { MobileBookingFlow } from './MobileBookingFlow';

type BookingCalendarProps = {
  mode: SessionMode;
  user?: User;
  spaces: Space[];
  pricingModules: PricingModule[];
  preferredSpaceId?: string;
  onSpaceSelected?: (spaceId: string) => void;
  onSignIn?: () => void;
  onBookingCreated?: (booking: Booking) => void;
};

export function BookingCalendar(props: BookingCalendarProps) {
  const calendar = useBookingCalendar(props);

  const hasCalendar = Boolean(calendar.currentCalendar && !calendar.isLoadingCalendar);

  return (
    <>
      <div className="desktop-booking-calendar">
        <div className="booking-calendar-layout booking-calendar-layout-premium">
          <div className="calendar-flow">
            <div className="calendar-flow-header">
              <div>
                <span className="eyebrow">Reserva online</span>
                <h3>Elegí espacio, duración y horario</h3>
              </div>
              <button className="ghost-button" onClick={calendar.refreshCalendar} disabled={!calendar.spaceId || calendar.isLoadingCalendar}>
                <RefreshCw size={16} /> Actualizar
              </button>
            </div>

            <CalendarToolbar
              spaces={props.spaces}
              selectedSpace={calendar.selectedSpace}
              spaceId={calendar.spaceId}
              moduleId={calendar.moduleId}
              selectedModule={calendar.selectedModule}
              pricingModules={calendar.availablePricingModules}
              onSpaceChange={calendar.setSpaceId}
              onModuleChange={calendar.setModuleId}
            />

            {calendar.isLoadingCalendar && <LoadingState label="Cargando disponibilidad..." />}
            {!props.spaces.length && <EmptyState title="No hay espacios cargados" text="Todavía no hay espacios activos para reservar." />}
            {props.spaces.length > 0 && !calendar.availablePricingModules.length && <EmptyState title="Sin módulos de precio" text="Este espacio todavía no tiene módulos de precio activos." />}
            {props.spaces.length > 0 && !calendar.currentCalendar && !calendar.isLoadingCalendar && <EmptyState title="Sin calendario disponible" text="No hay reglas de disponibilidad para el espacio seleccionado." />}

            {hasCalendar && (
              <CalendarGrid
                days={calendar.currentCalendar!.days}
                selected={calendar.selected}
                onSlotClick={calendar.selectSlot}
              />
            )}

            {calendar.message && <p className="calendar-message">{calendar.message}</p>}
          </div>

          <CalendarFooter
            mode={props.mode}
            selected={calendar.selected}
            selectedBlocks={calendar.selectedBlocks}
            selectedModule={calendar.selectedModule}
            selectedSpace={calendar.selectedSpace}
            spaceId={calendar.spaceId}
            requiredBlocks={calendar.requiredBlocks}
            blockHours={calendar.blockHours}
            isWeekly={calendar.isWeekly}
            isSelectionComplete={calendar.isSelectionComplete}
            onCreateBooking={calendar.createBooking}
          />
        </div>
      </div>

      <div className="mobile-booking-calendar">
        {calendar.isLoadingCalendar && <LoadingState label="Cargando disponibilidad..." />}
        {!props.spaces.length && <EmptyState title="No hay espacios cargados" text="Todavía no hay espacios activos para reservar." />}
        {props.spaces.length > 0 && !calendar.availablePricingModules.length && <EmptyState title="Sin módulos de precio" text="Este espacio todavía no tiene módulos de precio activos." />}
        {props.spaces.length > 0 && !calendar.currentCalendar && !calendar.isLoadingCalendar && <EmptyState title="Sin calendario disponible" text="No hay reglas de disponibilidad para el espacio seleccionado." />}

        {hasCalendar && (
          <MobileBookingFlow
            mode={props.mode}
            spaces={props.spaces}
            selectedSpace={calendar.selectedSpace}
            selectedSpaceId={calendar.spaceId}
            pricingModules={calendar.availablePricingModules}
            selectedModule={calendar.selectedModule}
            selectedModuleId={calendar.moduleId}
            days={calendar.currentCalendar!.days}
            selected={calendar.selected}
            selectedBlocks={calendar.selectedBlocks}
            requiredBlocks={calendar.requiredBlocks}
            blockHours={calendar.blockHours}
            isWeekly={calendar.isWeekly}
            isSelectionComplete={calendar.isSelectionComplete}
            onSpaceChange={calendar.setSpaceId}
            onModuleChange={calendar.setModuleId}
            onSlotClick={calendar.selectSlot}
            onCreateBooking={calendar.createBooking}
          />
        )}

        {calendar.message && <p className="calendar-message mobile-calendar-message">{calendar.message}</p>}
      </div>
    </>
  );
}
