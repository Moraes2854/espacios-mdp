import { api } from '../../api';
import { LeadsTable } from '../../components/dashboard/admin/LeadsTable';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { AdminPageState } from './AdminPageState';

export function AdminLeadsPage() {
  const { data, isLoading, error } = useAsyncResource(() => api.getLeads(), {
    initialData: [],
    errorMessage: 'No se pudieron cargar las consultas.',
  });

  return (
    <section className="panel-card clean-panel">
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando consultas...">
        <LeadsTable leads={data} />
      </AdminPageState>
    </section>
  );
}
