import { api } from '../../api';
import { UsersTable } from '../../components/dashboard/admin/UsersTable';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { AdminPageState } from './AdminPageState';

export function AdminUsersPage() {
  const { data, isLoading, error } = useAsyncResource(() => api.getUsers(), {
    initialData: [],
    errorMessage: 'No se pudieron cargar los usuarios.',
  });

  return (
    <section className="panel-card clean-panel">
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando usuarios...">
        <UsersTable users={data} />
      </AdminPageState>
    </section>
  );
}
