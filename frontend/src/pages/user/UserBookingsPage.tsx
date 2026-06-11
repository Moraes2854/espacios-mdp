import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { BookingList } from '../../components/dashboard/user/BookingList';
import { useUserBookings } from '../../hooks/useUserBookings';
import { User } from '../../types';

type UserBookingsPageProps = {
  user: User;
};

export function UserBookingsPage({ user }: UserBookingsPageProps) {
  const { bookings, isLoading, error } = useUserBookings(user.id);

  return (
    <section className="panel-card clean-panel">
      <h2>Mis reservas</h2>
      {isLoading ? <LoadingState /> : error ? <EmptyState title="Error" text={error} /> : <BookingList bookings={bookings} variant="table" />}
    </section>
  );
}
