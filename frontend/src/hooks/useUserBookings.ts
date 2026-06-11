import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { Booking } from '../types';

type UserBookingsState = {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
};

export function useUserBookings(userId: string) {
  const [state, setState] = useState<UserBookingsState>({ bookings: [], isLoading: true, error: null });

  const refetch = useCallback(() => {
    if (!userId) return;
    setState((current) => ({ ...current, isLoading: true, error: null }));

    api.getBookings(userId)
      .then((response) => setState({ bookings: response, isLoading: false, error: null }))
      .catch(() => setState({ bookings: [], isLoading: false, error: 'No se pudieron cargar tus reservas.' }));
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  function prependBooking(booking: Booking) {
    setState((current) => ({ ...current, bookings: [booking, ...current.bookings] }));
  }

  return { ...state, refetch, prependBooking };
}
