import { api } from '../../api';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { SpacesSection } from '../../components/marketing/SpacesSection';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { UserSection } from '../../utils/router';

type UserSpacesPageProps = {
  onNavigate: (section: UserSection) => void;
};

export function UserSpacesPage({ onNavigate }: UserSpacesPageProps) {
  const { data, isLoading, error } = useAsyncResource(() => api.getSpaces(), {
    initialData: [],
    errorMessage: 'No se pudieron cargar los espacios.',
  });

  if (isLoading) return <LoadingState label="Cargando espacios..." />;
  if (error) return <EmptyState title="No se pudieron cargar los espacios" text={error} />;

  return <SpacesSection spaces={data} onSelectSpace={() => onNavigate('calendar')} />;
}
