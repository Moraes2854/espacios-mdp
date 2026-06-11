import { PricingModule } from '../../../types';
import { translateModuleType } from '../../../utils/adminTranslations';
import { formatMoney } from '../../../utils/formatters';
import { moduleDisplayName, moduleHours } from '../../../utils/pricingModules';
import { StatusBadge } from '../../common/StatusBadge';
import { Table } from '../../common/Table';
import { AdminMobileCard } from './AdminMobileCard';

type PricingModulesAdminProps = { pricingModules: PricingModule[] };

function moduleSpaceLabel(module: PricingModule) {
  return module.space?.name || module.spaceId || '-';
}

export function PricingModulesAdmin({ pricingModules }: PricingModulesAdminProps) {
  return (
    <div className="table-block admin-data-block">
      <div className="admin-table-heading">
        <div>
          <h2>Módulos de precio</h2>
          <p>Configuración de duración y precio por espacio.</p>
        </div>
        <span>{pricingModules.length} {pricingModules.length === 1 ? 'módulo' : 'módulos'}</span>
      </div>
      <Table
        headers={['Espacio', 'Módulo', 'Tipo', 'Horas', 'Precio/h', 'Total', 'Estado']}
        empty={!pricingModules.length}
        emptyLabel="No hay módulos cargados."
        mobileCards={pricingModules.map((module) => (
          <AdminMobileCard
            key={module.id}
            title={moduleDisplayName(module)}
            subtitle={moduleSpaceLabel(module)}
            badge={<StatusBadge status={module.isActive ? 'ACTIVE' : 'INACTIVE'} />}
            rows={[
              { label: 'Tipo', value: translateModuleType(module.moduleType) },
              { label: 'Horas', value: moduleHours(module) },
              { label: 'Precio por hora', value: formatMoney(module.pricePerHour) },
              { label: 'Total', value: formatMoney(module.totalPrice) },
            ]}
          />
        ))}
      >
        {pricingModules.map((module) => (
          <tr key={module.id}>
            <td>{moduleSpaceLabel(module)}</td>
            <td>{moduleDisplayName(module)}</td>
            <td>{translateModuleType(module.moduleType)}</td>
            <td>{moduleHours(module)}</td>
            <td>{formatMoney(module.pricePerHour)}</td>
            <td>{formatMoney(module.totalPrice)}</td>
            <td><StatusBadge status={module.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
