import { AuditLog } from '../../../types';
import { translateAuditAction, translateEntityType } from '../../../utils/adminTranslations';
import { formatDateTime } from '../../../utils/formatters';
import { Table } from '../../common/Table';
import { AdminMobileCard } from './AdminMobileCard';

type AuditTableProps = { auditLogs: AuditLog[] };

export function AuditTable({ auditLogs }: AuditTableProps) {
  return (
    <div className="table-block admin-data-block">
      <div className="admin-table-heading">
        <h2>Auditoría</h2>
        <span>{auditLogs.length} {auditLogs.length === 1 ? 'evento' : 'eventos'}</span>
      </div>
      <Table
        headers={['Acción', 'Entidad', 'Usuario', 'Fecha']}
        empty={!auditLogs.length}
        emptyLabel="No hay eventos de auditoría."
        mobileCards={auditLogs.map((log) => (
          <AdminMobileCard
            key={log.id}
            title={translateAuditAction(log.action)}
            subtitle={translateEntityType(log.entityType)}
            rows={[
              { label: 'Usuario', value: log.user?.email || '-' },
              { label: 'Fecha', value: formatDateTime(log.createdAt) },
            ]}
          />
        ))}
      >
        {auditLogs.map((log) => (
          <tr key={log.id}>
            <td>{translateAuditAction(log.action)}</td>
            <td>{translateEntityType(log.entityType)}</td>
            <td>{log.user?.email || '-'}</td>
            <td>{formatDateTime(log.createdAt)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
