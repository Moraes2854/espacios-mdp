import '../../styles/admin-resources.css';
import { api } from '../../api';
import { AmenityForm } from '../../components/dashboard/admin/AmenityForm';
import { AmenitiesList } from '../../components/dashboard/admin/AmenitiesList';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { Amenity, AmenityPayload } from '../../types';
import { adminSectionPath, currentPath, getAdminAmenityRoute, navigateTo } from '../../utils/router';
import { AdminPageState } from './AdminPageState';

function findAmenity(amenities: Amenity[], id: string | null) {
  if (!id) return null;
  return amenities.find((amenity) => amenity.id === id) || null;
}

export function AdminAmenitiesPage() {
  const route = getAdminAmenityRoute(currentPath());
  const { data, isLoading, error, refetch } = useAsyncResource(() => api.getAmenities({ includeInactive: true }), {
    initialData: [],
    errorMessage: 'No se pudieron cargar los servicios.',
  });

  async function createAmenity(payload: AmenityPayload) {
    await api.createAmenity(payload);
    await refetch();
    navigateTo(adminSectionPath('amenities'));
  }

  async function updateAmenity(payload: AmenityPayload) {
    if (!route.id) return;
    await api.updateAmenity(route.id, payload);
    await refetch();
    navigateTo(adminSectionPath('amenities'));
  }

  async function toggleAmenityActive(id: string, isActive: boolean) {
    await api.setAmenityActive(id, isActive);
    await refetch();
  }

  const selectedAmenity = findAmenity(data, route.id);

  return (
    <section className="panel-card clean-panel panel-card--flush-mobile">
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando servicios...">
        {route.mode === 'create' ? (
          <AmenityForm mode="create" onSave={createAmenity} />
        ) : null}

        {route.mode === 'edit' && selectedAmenity ? (
          <AmenityForm
            mode="edit"
            amenity={selectedAmenity}
            onSave={updateAmenity}
            onDelete={async () => {
              if (!route.id) return;
              await toggleAmenityActive(route.id, false);
              navigateTo(adminSectionPath('amenities'));
            }}
          />
        ) : null}

        {route.mode === 'edit' && !selectedAmenity ? (
          <div className="admin-resource__empty">
            <h3>No encontramos este servicio</h3>
            <p>Puede haber sido eliminado o no estar disponible.</p>
            <button className="primary-button" onClick={() => navigateTo(adminSectionPath('amenities'))}>Volver a servicios</button>
          </div>
        ) : null}

        {route.mode === 'list' ? (
          <AmenitiesList amenities={data} onToggleActive={toggleAmenityActive} />
        ) : null}
      </AdminPageState>
    </section>
  );
}
