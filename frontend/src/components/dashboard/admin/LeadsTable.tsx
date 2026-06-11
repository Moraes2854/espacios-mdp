import { Lead } from '../../../types';
import { translateLeadSource } from '../../../utils/adminTranslations';
import { formatDateTime } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { Table } from '../../common/Table';
import { AdminMobileCard } from './AdminMobileCard';

type LeadsTableProps = { leads: Lead[] };

export function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <div className="table-block admin-data-block">
      <div className="admin-table-heading">
        <h2>Consultas</h2>
        <span>{leads.length} {leads.length === 1 ? 'consulta' : 'consultas'}</span>
      </div>
      <Table
        headers={['Nombre', 'Contacto', 'Espacio', 'Estado', 'Origen', 'Fecha']}
        empty={!leads.length}
        emptyLabel="No hay consultas cargadas."
        mobileCards={leads.map((lead) => (
          <AdminMobileCard
            key={lead.id}
            title={lead.name || 'Consulta sin nombre'}
            subtitle={lead.phone || lead.email || 'Sin contacto'}
            badge={<StatusBadge status={lead.status} />}
            rows={[
              { label: 'Espacio', value: lead.desiredSpace?.name || '-' },
              { label: 'Origen', value: translateLeadSource(lead.source) },
              { label: 'Fecha', value: formatDateTime(lead.createdAt) },
            ]}
          />
        ))}
      >
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td>{lead.name || '-'}</td>
            <td>{lead.phone || lead.email || '-'}</td>
            <td>{lead.desiredSpace?.name || '-'}</td>
            <td><StatusBadge status={lead.status} /></td>
            <td>{translateLeadSource(lead.source)}</td>
            <td>{formatDateTime(lead.createdAt)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
