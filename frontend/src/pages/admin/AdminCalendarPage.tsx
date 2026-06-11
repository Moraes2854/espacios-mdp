import { BookingCalendar } from '../../components/calendar/BookingCalendar';
import { useAdminCalendarData } from '../../hooks/admin/useAdminCalendarData';
import { User } from '../../types';
import { AdminPageState } from './AdminPageState';

type AdminCalendarPageProps = {
  user: User;
};

export function AdminCalendarPage({ user }: AdminCalendarPageProps) {
  const { spaces, pricingModules, isLoading, error, refetch } = useAdminCalendarData();

  return (
    <section className="panel-card clean-panel">
      <h2>Calendario global</h2>
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando calendario...">
        <BookingCalendar
          mode="admin"
          user={user}
          spaces={spaces}
          pricingModules={pricingModules}
          onBookingCreated={refetch}
        />
      </AdminPageState>
    </section>
  );
}
