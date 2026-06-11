import { Space } from '../../../types';
import { formatMoney } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { Table } from '../../common/Table';
import { AdminMobileCard } from './AdminMobileCard';

type SpacesAdminProps = { spaces: Space[] };

function locationLabel(space: Space) {
  return [space.address, space.floor].filter(Boolean).join(' · ') || '-';
}

export function SpacesAdmin({ spaces }: SpacesAdminProps) {
  return (
    <div className="table-block admin-data-block">
      <div className="admin-table-heading">
        <h2>Espacios</h2>
        <span>{spaces.length} {spaces.length === 1 ? 'espacio' : 'espacios'}</span>
      </div>
      <Table
        headers={['Nombre', 'Ubicación', 'Capacidad', 'Precio base', 'Estado']}
        empty={!spaces.length}
        emptyLabel="No hay espacios activos."
        mobileCards={spaces.map((space) => (
          <AdminMobileCard
            key={space.id}
            title={space.name}
            subtitle={locationLabel(space)}
            badge={<StatusBadge status={space.isActive ? 'ACTIVE' : 'INACTIVE'} />}
            rows={[
              { label: 'Capacidad', value: space.capacity || '-' },
              { label: 'Precio base', value: formatMoney(space.baseHourlyPrice) },
              { label: 'Amenities', value: space.amenities?.map((amenity) => amenity.name).join(', ') || '-' },
            ]}
          />
        ))}
      >
        {spaces.map((space) => (
          <tr key={space.id}>
            <td>{space.name}</td>
            <td>{locationLabel(space)}</td>
            <td>{space.capacity || '-'}</td>
            <td>{formatMoney(space.baseHourlyPrice)}</td>
            <td><StatusBadge status={space.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
