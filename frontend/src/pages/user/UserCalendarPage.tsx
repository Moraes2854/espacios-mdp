import { BookingCalendar } from '../../components/calendar/BookingCalendar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { useCoreData } from '../../hooks/useCoreData';
import { User } from '../../types';

type UserCalendarPageProps = {
  user: User;
};

export function UserCalendarPage({ user }: UserCalendarPageProps) {
  const { spaces, pricingModules, isLoading, error } = useCoreData();

  return (
    <section className="panel-card clean-panel">
      <h2>Reservar horario</h2>
      {isLoading && <LoadingState label="Cargando disponibilidad..." />}
      {error && <EmptyState title="Backend no disponible" text={error} />}
      {!isLoading && !error && (
        <BookingCalendar
          mode="user"
          user={user}
          spaces={spaces}
          pricingModules={pricingModules}
        />
      )}
    </section>
  );
}
