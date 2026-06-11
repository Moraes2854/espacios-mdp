import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { AdminDashboard } from '../types';
import { EMPTY_ADMIN_DASHBOARD } from '../utils/adminDashboard';

type AdminDashboardState = {
  dashboard: AdminDashboard;
  isLoading: boolean;
  error: string | null;
};

export function useAdminDashboard() {
  const [state, setState] = useState<AdminDashboardState>({
    dashboard: EMPTY_ADMIN_DASHBOARD,
    isLoading: true,
    error: null,
  });

  const refetch = useCallback(() => {
    setState((current) => ({ ...current, isLoading: true, error: null }));

    api.getAdminDashboard()
      .then((response) => setState({ dashboard: response, isLoading: false, error: null }))
      .catch(() => setState({ dashboard: EMPTY_ADMIN_DASHBOARD, isLoading: false, error: 'No se pudo cargar la información del panel.' }));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
