import { api } from '../../api';
import { BookingsTable } from '../../components/dashboard/admin/BookingsTable';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { AdminPageState } from './AdminPageState';

export function AdminBookingsPage() {
  const { data, isLoading, error } = useAsyncResource(() => api.getBookings(), {
    initialData: [],
    errorMessage: 'No se pudieron cargar las reservas.',
  });

  return (
    <section className="panel-card clean-panel">
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando reservas...">
        <BookingsTable bookings={data} />
      </AdminPageState>
    </section>
  );
}
