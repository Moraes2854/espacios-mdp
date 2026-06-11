import { api } from '../../api';
import { AuditTable } from '../../components/dashboard/admin/AuditTable';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { AdminPageState } from './AdminPageState';

export function AdminAuditPage() {
  const { data, isLoading, error } = useAsyncResource(() => api.getAuditLogs(), {
    initialData: [],
    errorMessage: 'No se pudo cargar la auditoría.',
  });

  return (
    <section className="panel-card clean-panel">
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando auditoría...">
        <AuditTable auditLogs={data} />
      </AdminPageState>
    </section>
  );
}
