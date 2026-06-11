import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api';
import { PricingModule, Space } from '../../types';

type AdminCalendarDataState = {
  spaces: Space[];
  pricingModules: PricingModule[];
  isLoading: boolean;
  error: string | null;
};

export function useAdminCalendarData() {
  const [state, setState] = useState<AdminCalendarDataState>({
    spaces: [],
    pricingModules: [],
    isLoading: true,
    error: null,
  });

  const refetch = useCallback(() => {
    setState((current) => ({ ...current, isLoading: true, error: null }));

    Promise.all([api.getSpaces(), api.getPricingModules()])
      .then(([spaces, pricingModules]) => {
        setState({ spaces, pricingModules, isLoading: false, error: null });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'No se pudo cargar el calendario administrativo.';
        setState({ spaces: [], pricingModules: [], isLoading: false, error: message });
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
