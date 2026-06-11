import { AdminSummary } from '../../components/dashboard/admin/AdminSummary';
import { AdminTab } from '../../components/dashboard/admin/AdminTabs';
import { useAdminSummary } from '../../hooks/admin/useAdminSummary';
import { User } from '../../types';
import { AdminPageState } from './AdminPageState';

type AdminSummaryPageProps = {
  user: User;
  onNavigate: (tab: AdminTab) => void;
};

function estimatedOccupancy(activeBookings: number, activeSpaces: number) {
  const totalSlots = activeSpaces * 7 * 8;
  if (!totalSlots) return 0;
  return Math.min((activeBookings / totalSlots) * 100, 100);
}

export function AdminSummaryPage({ user, onNavigate }: AdminSummaryPageProps) {
  const { data, isLoading, error } = useAdminSummary();
  const occupancy = estimatedOccupancy(data.metrics.activeBookings, data.metrics.activeSpaces);

  return (
    <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando resumen...">
      <AdminSummary
        metrics={data.metrics}
        recentBookings={data.recentBookings}
        recentLeads={data.recentLeads}
        occupancy={occupancy}
        user={user}
        onChangeTab={onNavigate}
      />
    </AdminPageState>
  );
}
