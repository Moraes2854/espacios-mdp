import { User } from '../../../types';
import { translateRole } from '../../../utils/adminTranslations';
import { fullName } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { Table } from '../../common/Table';
import { AdminMobileCard } from './AdminMobileCard';

type UsersTableProps = { users: User[] };

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="table-block admin-data-block">
      <div className="admin-table-heading">
        <h2>Usuarios</h2>
        <span>{users.length} {users.length === 1 ? 'usuario' : 'usuarios'}</span>
      </div>
      <Table
        headers={['Nombre', 'Email', 'Teléfono', 'Rol', 'Profesión', 'Estado']}
        empty={!users.length}
        emptyLabel="No hay usuarios cargados."
        mobileCards={users.map((user) => (
          <AdminMobileCard
            key={user.id}
            title={fullName(user)}
            subtitle={user.email}
            badge={<StatusBadge status={user.status || 'ACTIVE'} />}
            rows={[
              { label: 'Teléfono', value: user.phone || '-' },
              { label: 'Rol', value: translateRole(user.role) },
              { label: 'Profesión', value: user.professionalProfile?.profession || '-' },
              { label: 'Documento', value: user.professionalProfile?.documentNumber || '-' },
            ]}
          />
        ))}
      >
        {users.map((user) => (
          <tr key={user.id}>
            <td>{fullName(user)}</td>
            <td>{user.email}</td>
            <td>{user.phone || '-'}</td>
            <td>{translateRole(user.role)}</td>
            <td>{user.professionalProfile?.profession || '-'}</td>
            <td><StatusBadge status={user.status || 'ACTIVE'} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
