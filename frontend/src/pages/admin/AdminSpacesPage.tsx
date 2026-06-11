import '../../styles/admin-resources.css';
import { api } from '../../api';
import { SpaceForm } from '../../components/dashboard/admin/SpaceForm';
import { SpacesList } from '../../components/dashboard/admin/SpacesList';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { Amenity, AmenityPayload, Space, SpacePayload } from '../../types';
import { adminSectionPath, currentPath, getAdminSpaceRoute, navigateTo } from '../../utils/router';
import { AdminPageState } from './AdminPageState';

type SpacesResource = {
  spaces: Space[];
  amenities: Amenity[];
};

function findSpace(spaces: Space[], id: string | null) {
  if (!id) return null;
  return spaces.find((space) => space.id === id) || null;
}

async function loadSpacesResource(): Promise<SpacesResource> {
  const [spaces, amenities] = await Promise.all([
    api.getSpaces({ includeInactive: true }),
    api.getAmenities({ includeInactive: false }),
  ]);

  return { spaces, amenities };
}

export function AdminSpacesPage() {
  const route = getAdminSpaceRoute(currentPath());
  const { data, isLoading, error, refetch } = useAsyncResource(loadSpacesResource, {
    initialData: { spaces: [], amenities: [] },
    errorMessage: 'No se pudieron cargar los espacios.',
  });

  async function createAmenity(payload: AmenityPayload) {
    const amenity = await api.createAmenity(payload);
    await refetch();
    return amenity;
  }

  async function createSpace(payload: SpacePayload) {
    await api.createSpace(payload);
    await refetch();
    navigateTo(adminSectionPath('spaces'));
  }

  async function updateSpace(payload: SpacePayload) {
    if (!route.id) return;
    await api.updateSpace(route.id, payload);
    await refetch();
    navigateTo(adminSectionPath('spaces'));
  }

  async function toggleSpaceActive(id: string, isActive: boolean) {
    await api.setSpaceActive(id, isActive);
    await refetch();
  }

  const selectedSpace = findSpace(data.spaces, route.id);

  return (
    <section className="panel-card clean-panel panel-card--flush-mobile">
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando espacios...">
        {route.mode === 'create' ? (
          <SpaceForm mode="create" amenities={data.amenities} onCreateAmenity={createAmenity} onSave={createSpace} />
        ) : null}

        {route.mode === 'edit' && selectedSpace ? (
          <SpaceForm
            mode="edit"
            space={selectedSpace}
            amenities={data.amenities}
            onCreateAmenity={createAmenity}
            onSave={updateSpace}
            onDelete={async () => {
              if (!route.id) return;
              await toggleSpaceActive(route.id, false);
              navigateTo(adminSectionPath('spaces'));
            }}
          />
        ) : null}

        {route.mode === 'edit' && !selectedSpace ? (
          <div className="admin-resource__empty">
            <h3>No encontramos este espacio</h3>
            <p>Puede haber sido eliminado o no estar disponible.</p>
            <button className="primary-button" onClick={() => navigateTo(adminSectionPath('spaces'))}>Volver a espacios</button>
          </div>
        ) : null}

        {route.mode === 'list' ? (
          <SpacesList spaces={data.spaces} onToggleActive={toggleSpaceActive} />
        ) : null}
      </AdminPageState>
    </section>
  );
}
