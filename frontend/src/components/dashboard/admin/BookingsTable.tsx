import { Booking } from '../../../types';
import { formatDateRange, formatMoney } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { Table } from '../../common/Table';
import { AdminMobileCard } from './AdminMobileCard';

type BookingsTableProps = { bookings: Booking[] };

export function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <div className="table-block admin-data-block">
      <div className="admin-table-heading">
        <h2>Reservas</h2>
        <span>{bookings.length} {bookings.length === 1 ? 'registro' : 'registros'}</span>
      </div>
      <Table
        headers={['Espacio', 'Cliente', 'Horario', 'Módulo', 'Estado', 'Total']}
        empty={!bookings.length}
        emptyLabel="No hay reservas cargadas."
        mobileCards={bookings.map((booking) => (
          <AdminMobileCard
            key={booking.id}
            title={booking.space?.name || 'Reserva'}
            subtitle={booking.user?.email || booking.professionalProfile?.displayName || 'Sin cliente asignado'}
            badge={<StatusBadge status={booking.status} />}
            rows={[
              { label: 'Horario', value: formatDateRange(booking.startAt, booking.endAt) },
              { label: 'Módulo', value: booking.pricingModule?.name || booking.bookingType },
              { label: 'Total', value: formatMoney(booking.totalPrice) },
            ]}
          />
        ))}
      >
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td>{booking.space?.name || '-'}</td>
            <td>{booking.user?.email || booking.professionalProfile?.displayName || '-'}</td>
            <td>{formatDateRange(booking.startAt, booking.endAt)}</td>
            <td>{booking.pricingModule?.name || booking.bookingType}</td>
            <td><StatusBadge status={booking.status} /></td>
            <td>{formatMoney(booking.totalPrice)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
