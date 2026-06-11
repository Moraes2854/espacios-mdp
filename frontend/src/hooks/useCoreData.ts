import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { PricingModule, Space } from '../types';

type CoreDataState = {
  spaces: Space[];
  pricingModules: PricingModule[];
  isLoading: boolean;
  error: string | null;
};

export function useCoreData() {
  const [state, setState] = useState<CoreDataState>({
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
      .catch(() => {
        setState({
          spaces: [],
          pricingModules: [],
          isLoading: false,
          error: 'No se pudo conectar con el backend. No se muestran datos mockeados.',
        });
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
