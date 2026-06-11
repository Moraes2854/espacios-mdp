import { ReactNode } from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';

type AdminPageStateProps = {
  isLoading: boolean;
  error: string | null;
  loadingLabel?: string;
  children: ReactNode;
};

export function AdminPageState({ isLoading, error, loadingLabel = 'Cargando información...', children }: AdminPageStateProps) {
  if (isLoading) return <LoadingState label={loadingLabel} />;
  if (error) return <EmptyState title="No se pudo cargar esta sección" text={error} />;
  return <>{children}</>;
}
