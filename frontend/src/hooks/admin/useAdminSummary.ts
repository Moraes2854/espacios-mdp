import { api } from '../../api';
import { AdminSummaryDashboard } from '../../types';
import { useAsyncResource } from '../useAsyncResource';

const EMPTY_ADMIN_SUMMARY: AdminSummaryDashboard = {
  metrics: {
    activeSpaces: 0,
    totalUsers: 0,
    newLeads: 0,
    activeBookings: 0,
    approvedRevenue: 0,
  },
  recentBookings: [],
  recentLeads: [],
};

export function useAdminSummary() {
  return useAsyncResource(() => api.getAdminSummary(), {
    initialData: EMPTY_ADMIN_SUMMARY,
    errorMessage: 'No se pudo cargar el resumen del panel.',
  });
}
