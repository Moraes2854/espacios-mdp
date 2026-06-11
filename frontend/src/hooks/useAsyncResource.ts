import { useCallback, useEffect, useState } from 'react';

type AsyncResourceState<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
};

type UseAsyncResourceOptions<T> = {
  initialData: T;
  errorMessage: string;
  enabled?: boolean;
  deps?: ReadonlyArray<unknown>;
};

export function useAsyncResource<T>(loader: () => Promise<T>, options: UseAsyncResourceOptions<T>) {
  const { initialData, errorMessage, enabled = true, deps = [] } = options;
  const [state, setState] = useState<AsyncResourceState<T>>({
    data: initialData,
    isLoading: enabled,
    error: null,
  });

  const refetch = useCallback(() => {
    if (!enabled) return;

    setState((current) => ({ ...current, isLoading: true, error: null }));

    loader()
      .then((response) => setState({ data: response, isLoading: false, error: null }))
      .catch((error) => {
        const message = error instanceof Error ? error.message : errorMessage;
        setState({ data: initialData, isLoading: false, error: message || errorMessage });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, errorMessage, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
