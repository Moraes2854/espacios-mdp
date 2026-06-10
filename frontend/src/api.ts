import {
  AdminDashboard,
  Booking,
  Lead,
  PricingModule,
  SessionMode,
  Space,
  SpaceAvailabilityCalendar,
  User,
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getSpaces: () => request<Space[]>('/spaces'),
  getPricingModules: () => request<PricingModule[]>('/pricing-modules'),
  getAvailabilitySlots: (params?: { spaceId?: string; from?: string; days?: number }) => {
    const query = new URLSearchParams();
    if (params?.spaceId) query.set('spaceId', params.spaceId);
    if (params?.from) query.set('from', params.from);
    if (params?.days) query.set('days', String(params.days));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<SpaceAvailabilityCalendar[]>(`/availability/slots${suffix}`);
  },
  getBookings: (userId?: string) => request<Booking[]>(`/bookings${userId ? `?userId=${userId}` : ''}`),
  getAdminDashboard: () => request<AdminDashboard>('/admin/dashboard'),
  createLead: (data: Partial<Lead>) =>
    request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createBooking: (data: Partial<Booking> & { pricingModuleId?: string }) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  devLogin: (mode: SessionMode) =>
    request<{ token: string; user: User }>('/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ role: mode === 'admin' ? 'ADMIN' : 'PROFESSIONAL' }),
    }),
};
