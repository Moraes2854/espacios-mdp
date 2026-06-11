import { CalendarDays, CreditCard, ListChecks } from 'lucide-react';
import { useMemo } from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { Metric } from '../../components/common/Metric';
import { ProfileCard } from '../../components/common/ProfileCard';
import { BookingList } from '../../components/dashboard/user/BookingList';
import { useUserBookings } from '../../hooks/useUserBookings';
import { User } from '../../types';
import { formatMoney } from '../../utils/formatters';
import { UserSection } from '../../utils/router';

type UserSummaryPageProps = {
  user: User;
  onNavigate: (section: UserSection) => void;
};

export function UserSummaryPage({ user, onNavigate }: UserSummaryPageProps) {
  const { bookings, isLoading, error } = useUserBookings(user.id);

  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => new Date(booking.endAt) >= new Date()).slice(0, 4),
    [bookings],
  );
  const totalPending = useMemo(
    () => bookings.filter((booking) => ['PENDING', 'CONFIRMED'].includes(booking.status)).reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
    [bookings],
  );

  return (
    <div className="dashboard-content-stack">
      <section className="welcome-card">
        <div>
          <span className="eyebrow">Usuario registrado</span>
          <h2>Hola, {user.firstName || 'bienvenido'}</h2>
          <p>Reservá por módulo y consultá tus próximas reservas desde un mismo lugar.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate('calendar')}>
          <CalendarDays size={18} /> Nueva reserva
        </button>
      </section>

      <div className="metric-grid user-metrics">
        <Metric label="Próximas reservas" value={upcomingBookings.length} Icon={CalendarDays} />
        <Metric label="Reservas totales" value={bookings.length} Icon={ListChecks} />
        <Metric label="Pendiente/confirmado" value={formatMoney(totalPending)} Icon={CreditCard} />
      </div>

      <div className="content-grid two-one">
        <section className="panel-card">
          <div className="panel-header-row">
            <h3>Próximas reservas</h3>
            <button className="link-button" onClick={() => onNavigate('bookings')}>Ver todas</button>
          </div>
          {isLoading ? <LoadingState /> : error ? <EmptyState title="Error" text={error} /> : <BookingList bookings={upcomingBookings} />}
        </section>

        <section className="panel-card">
          <h3>Perfil profesional</h3>
          <ProfileCard user={user} />
        </section>
      </div>
    </div>
  );
}
