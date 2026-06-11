import { Payment } from '../../../types';
import { translatePaymentMethod } from '../../../utils/adminTranslations';
import { formatMoney } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { Table } from '../../common/Table';
import { AdminMobileCard } from './AdminMobileCard';

type PaymentsTableProps = { payments: Payment[] };

export function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <div className="table-block admin-data-block">
      <div className="admin-table-heading">
        <h2>Pagos</h2>
        <span>{payments.length} {payments.length === 1 ? 'pago' : 'pagos'}</span>
      </div>
      <Table
        headers={['Reserva', 'Usuario', 'Método', 'Estado', 'Monto']}
        empty={!payments.length}
        emptyLabel="No hay pagos cargados."
        mobileCards={payments.map((payment) => (
          <AdminMobileCard
            key={payment.id}
            title={formatMoney(payment.amount)}
            subtitle={payment.booking?.space?.name || payment.bookingId}
            badge={<StatusBadge status={payment.status} />}
            rows={[
              { label: 'Usuario', value: payment.user?.email || '-' },
              { label: 'Método', value: translatePaymentMethod(payment.method) },
              { label: 'Moneda', value: payment.currency || 'ARS' },
            ]}
          />
        ))}
      >
        {payments.map((payment) => (
          <tr key={payment.id}>
            <td>{payment.booking?.space?.name || payment.bookingId}</td>
            <td>{payment.user?.email || '-'}</td>
            <td>{translatePaymentMethod(payment.method)}</td>
            <td><StatusBadge status={payment.status} /></td>
            <td>{formatMoney(payment.amount)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
