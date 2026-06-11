import { api } from '../../api';
import { PaymentsTable } from '../../components/dashboard/admin/PaymentsTable';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { AdminPageState } from './AdminPageState';

export function AdminPaymentsPage() {
  const { data, isLoading, error } = useAsyncResource(() => api.getPayments(), {
    initialData: [],
    errorMessage: 'No se pudieron cargar los pagos.',
  });

  return (
    <section className="panel-card clean-panel">
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando pagos...">
        <PaymentsTable payments={data} />
      </AdminPageState>
    </section>
  );
}
