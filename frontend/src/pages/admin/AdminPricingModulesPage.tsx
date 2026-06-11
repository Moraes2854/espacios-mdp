import '../../styles/admin-resources.css';
import { api } from '../../api';
import { PricingModuleForm } from '../../components/dashboard/admin/PricingModuleForm';
import { PricingModulesList } from '../../components/dashboard/admin/PricingModulesList';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { PricingModule, PricingModulePayload, Space } from '../../types';
import { adminSectionPath, currentPath, getAdminPricingModuleRoute, navigateTo } from '../../utils/router';
import { AdminPageState } from './AdminPageState';

type PricingModulesPageData = {
  modules: PricingModule[];
  spaces: Space[];
};

const initialData: PricingModulesPageData = {
  modules: [],
  spaces: [],
};

function findModule(modules: PricingModule[], id: string | null) {
  if (!id) return null;
  return modules.find((module) => module.id === id) || null;
}

export function AdminPricingModulesPage() {
  const route = getAdminPricingModuleRoute(currentPath());
  const { data, isLoading, error, refetch } = useAsyncResource(
    async () => {
      const [modules, spaces] = await Promise.all([
        api.getPricingModules({ includeInactive: true }),
        api.getSpaces({ includeInactive: true }),
      ]);

      return { modules, spaces };
    },
    {
      initialData,
      errorMessage: 'No se pudieron cargar los módulos de precio.',
    },
  );

  async function createModule(payload: PricingModulePayload) {
    await api.createPricingModule(payload);
    await refetch();
    navigateTo(adminSectionPath('modules'));
  }

  async function updateModule(payload: PricingModulePayload) {
    if (!route.id) return;
    await api.updatePricingModule(route.id, payload);
    await refetch();
    navigateTo(adminSectionPath('modules'));
  }

  async function toggleModuleActive(id: string, isActive: boolean) {
    await api.setPricingModuleActive(id, isActive);
    await refetch();
  }

  const selectedModule = findModule(data.modules, route.id);

  return (
    <section className="panel-card clean-panel panel-card--flush-mobile">
      <AdminPageState isLoading={isLoading} error={error} loadingLabel="Cargando módulos...">
        {route.mode === 'create' ? (
          <PricingModuleForm
            mode="create"
            spaces={data.spaces.filter((space) => space.isActive)}
            onSave={createModule}
          />
        ) : null}

        {route.mode === 'edit' && selectedModule ? (
          <PricingModuleForm
            mode="edit"
            spaces={data.spaces.filter((space) => space.isActive || space.id === selectedModule.spaceId)}
            module={selectedModule}
            onSave={updateModule}
            onDelete={async () => {
              if (!route.id) return;
              await toggleModuleActive(route.id, false);
              navigateTo(adminSectionPath('modules'));
            }}
          />
        ) : null}

        {route.mode === 'edit' && !selectedModule ? (
          <div className="admin-resource__empty">
            <h3>No encontramos este módulo</h3>
            <p>Puede haber sido eliminado o estar asociado a otro entorno.</p>
            <button className="primary-button" onClick={() => navigateTo(adminSectionPath('modules'))}>Volver a módulos</button>
          </div>
        ) : null}

        {route.mode === 'list' ? (
          <PricingModulesList modules={data.modules} onToggleActive={toggleModuleActive} />
        ) : null}
      </AdminPageState>
    </section>
  );
}
