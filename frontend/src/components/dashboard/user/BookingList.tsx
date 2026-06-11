import { Booking } from '../../../types';
import { formatDateRange, formatMoney } from '../../../utils/formatters';
import { EmptyState } from '../../common/EmptyState';
import { StatusBadge } from '../../common/StatusBadge';

type BookingListProps = {
  bookings: Booking[];
  variant?: 'cards' | 'table';
};

export function BookingList({ bookings, variant = 'cards' }: BookingListProps) {
  if (!bookings.length) return <EmptyState title="Todavía no tenés reservas" text="Elegí un módulo y seleccioná un horario disponible." />;

  if (variant === 'table') {
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Espacio</th>
              <th>Módulo</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{formatDateRange(booking.startAt, booking.endAt)}</td>
                <td>{booking.space?.name || 'Espacio'}</td>
                <td>{booking.pricingModule?.name || booking.bookingType}</td>
                <td><StatusBadge status={booking.status} /></td>
                <td>{formatMoney(booking.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="booking-card-list">
      {bookings.map((booking) => (
        <article className="booking-card" key={booking.id}>
          <div>
            <StatusBadge status={booking.status} />
            <h4>{booking.space?.name || 'Espacio'}</h4>
            <p>{formatDateRange(booking.startAt, booking.endAt)}</p>
            <small>{booking.pricingModule?.name || booking.bookingType}</small>
          </div>
          <strong>{formatMoney(booking.totalPrice)}</strong>
        </article>
      ))}
    </div>
  );
}
