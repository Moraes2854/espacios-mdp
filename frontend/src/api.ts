import {
  AdminDashboard,
  Amenity,
  AmenityPayload,
  AdminSummaryDashboard,
  AuditLog,
  AvailabilityBlock,
  AvailabilityRule,
  AuthSession,
  Booking,
  Lead,
  LoginPayload,
  MercadoPagoPreferenceRequest,
  MercadoPagoPreferenceResponse,
  Payment,
  PricingModule,
  PricingModulePayload,
  SignUpPayload,
  Space,
  SpaceAvailabilityCalendar,
  SpacePayload,
  User,
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const AUTH_STORAGE_KEY = 'espacios-mdp-auth-session';

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

function readStoredToken() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<AuthSession>;
    return typeof session.token === 'string' ? session.token : null;
  } catch {
    return null;
  }
}

async function parseError(response: Response) {
  const text = await response.text();
  if (!text) return `Request failed: ${response.status}`;

  try {
    const payload = JSON.parse(text) as ApiErrorPayload;
    if (Array.isArray(payload.message)) return payload.message.join(' ');
    return payload.message || payload.error || text;
  } catch {
    return text;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = readStoredToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<T>;
}

export const authStorage = {
  key: AUTH_STORAGE_KEY,
  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  },
  setSession(session: AuthSession) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  },
  clearSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};

function buildQuery(params?: Record<string, string | number | boolean | null | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== false) {
      query.set(key, String(value));
    }
  });

  return query.toString() ? `?${query.toString()}` : '';
}

export const api = {
  getAmenities: (params?: { includeInactive?: boolean; search?: string }) =>
    request<Amenity[]>(`/amenities${buildQuery({ includeInactive: params?.includeInactive, search: params?.search })}`),
  getAmenity: (id: string) => request<Amenity>(`/amenities/${id}`),
  createAmenity: (data: AmenityPayload) =>
    request<Amenity>('/amenities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAmenity: (id: string, data: Partial<AmenityPayload>) =>
    request<Amenity>(`/amenities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  setAmenityActive: (id: string, isActive: boolean) =>
    request<Amenity>(`/amenities/${id}/activation`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  getSpaces: (params?: { includeInactive?: boolean }) =>
    request<Space[]>(`/spaces${buildQuery({ includeInactive: params?.includeInactive })}`),
  getSpace: (id: string) => request<Space>(`/spaces/${id}`),
  createSpace: (data: SpacePayload) =>
    request<Space>('/spaces', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSpace: (id: string, data: Partial<SpacePayload>) =>
    request<Space>(`/spaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  setSpaceActive: (id: string, isActive: boolean) =>
    request<Space>(`/spaces/${id}/activation`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  deleteSpace: (id: string) => request<Space>(`/spaces/${id}`, { method: 'DELETE' }),

  getPricingModules: (params?: { spaceId?: string; includeInactive?: boolean }) =>
    request<PricingModule[]>(`/pricing-modules${buildQuery({ spaceId: params?.spaceId, includeInactive: params?.includeInactive })}`),
  getPricingModule: (id: string) => request<PricingModule>(`/pricing-modules/${id}`),
  createPricingModule: (data: PricingModulePayload) =>
    request<PricingModule>('/pricing-modules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePricingModule: (id: string, data: Partial<PricingModulePayload>) =>
    request<PricingModule>(`/pricing-modules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  setPricingModuleActive: (id: string, isActive: boolean) =>
    request<PricingModule>(`/pricing-modules/${id}/activation`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  deletePricingModule: (id: string) => request<PricingModule>(`/pricing-modules/${id}`, { method: 'DELETE' }),

  getAvailabilitySlots: (params?: { spaceId?: string; from?: string; days?: number }) =>
    request<SpaceAvailabilityCalendar[]>(
      `/availability/slots${buildQuery({ spaceId: params?.spaceId, from: params?.from, days: params?.days })}`,
    ),
  getBookings: (userId?: string) => request<Booking[]>(`/bookings${userId ? `?userId=${userId}` : ''}`),
  getAdminDashboard: () => request<AdminDashboard>('/admin/dashboard'),
  getAdminSummary: () => request<AdminSummaryDashboard>('/admin/summary'),
  getUsers: () => request<User[]>('/users'),
  getLeads: () => request<Lead[]>('/leads'),
  getPayments: () => request<Payment[]>('/payments'),
  getAuditLogs: () => request<AuditLog[]>('/audit-log'),
  getAvailabilityRules: () => request<AvailabilityRule[]>('/availability-rules'),
  getAvailabilityBlocks: () => request<AvailabilityBlock[]>('/availability-blocks'),
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
  createWeeklyPack: (data: {
    spaceId: string;
    userId?: string;
    professionalProfileId?: string;
    pricingModuleId: string;
    status?: string;
    notes?: string;
    blocks: { startAt: string; endAt: string }[];
  }) =>
    request<Booking[]>('/bookings/weekly-pack', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  signUp: (data: SignUpPayload) =>
    request<AuthSession>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: LoginPayload) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createMercadoPagoPreference: (data: MercadoPagoPreferenceRequest) =>
    request<MercadoPagoPreferenceResponse>('/payments/mercado-pago/preference', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<User>('/auth/me'),
};
