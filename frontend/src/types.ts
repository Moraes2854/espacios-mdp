export type UserRole = 'ADMIN' | 'OPERATOR' | 'PROFESSIONAL';
export type SessionMode = 'public' | 'user' | 'admin';

export type User = {
  id: string;
  email: string;
  passwordHash?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: UserRole;
  status?: string;
  professionalProfile?: ProfessionalProfile | null;
};

export type ProfessionalProfile = {
  id: string;
  userId: string;
  displayName?: string | null;
  profession?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  taxCondition?: string | null;
  billingEmail?: string | null;
  notes?: string | null;
};


export type AuthSession = {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profession?: string;
  documentNumber?: string;
  password: string;
};

export type PricingModuleType = 'SINGLE' | 'CONTINUOUS_BLOCK' | 'WEEKLY_PACK';

export type PricingModule = {
  id: string;
  spaceId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  moduleType: PricingModuleType;
  durationHours?: number | null;
  weeklyHours?: number | null;
  pricePerHour: string | number;
  totalPrice: string | number;
  isActive: boolean;
  sortOrder: number;
  space?: Space;
};

export type CalendarSlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'PAST';

export type CalendarSlot = {
  startAt: string;
  endAt: string;
  label: string;
  status: CalendarSlotStatus;
  bookingId?: string;
  bookingStatus?: string;
  blockReason?: string | null;
};

export type CalendarDay = {
  date: string;
  dayOfWeek: string;
  isClosed: boolean;
  slots: CalendarSlot[];
};

export type SpaceAvailabilityCalendar = {
  spaceId: string;
  spaceName: string;
  days: CalendarDay[];
};

export type Amenity = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  category?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type AmenityPayload = {
  name: string;
  slug?: string;
  icon?: string | null;
  description?: string | null;
  category?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type SpaceAmenity = {
  id: string;
  spaceId: string;
  amenityId?: string | null;
  amenity?: Amenity | null;
  name?: string | null;
  icon?: string | null;
  note?: string | null;
  isHighlighted?: boolean;
  position: number;
};

export type SpaceImage = {
  id: string;
  url: string;
  alt?: string | null;
  isCover: boolean;
  position: number;
};

export type AvailabilityRule = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  space?: Space;
};

export type AvailabilityBlock = {
  id: string;
  startAt: string;
  endAt: string;
  reason?: string | null;
  source: string;
  space?: Space;
};

export type RecurringBookingRule = {
  id: string;
  professionalProfileId: string;
  spaceId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startsOn: string;
  endsOn?: string | null;
  status: string;
  pricePerHour: string | number;
  notes?: string | null;
  space?: Space;
  professionalProfile?: ProfessionalProfile & { user?: User };
};

export type Space = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  capacity?: number | null;
  sizeM2?: number | null;
  floor?: string | null;
  address?: string | null;
  isActive: boolean;
  baseHourlyPrice: string | number;
  recurrentHourlyPrice?: string | number | null;
  amenities: SpaceAmenity[];
  images: SpaceImage[];
  availabilityRules?: AvailabilityRule[];
  availabilityBlocks?: AvailabilityBlock[];
  recurringRules?: RecurringBookingRule[];
};


export type SpacePayload = {
  name: string;
  slug?: string;
  description?: string | null;
  capacity?: number | null;
  floor?: string | null;
  address?: string | null;
  baseHourlyPrice: number;
  recurrentHourlyPrice?: number | null;
  amenityIds?: string[];
  isActive?: boolean;
};

export type Booking = {
  id: string;
  spaceId: string;
  userId?: string | null;
  professionalProfileId?: string | null;
  startAt: string;
  endAt: string;
  status: string;
  bookingType: string;
  pricePerHour: string | number;
  totalPrice: string | number;
  notes?: string | null;
  space?: Space;
  user?: User | null;
  professionalProfile?: ProfessionalProfile | null;
  pricingModuleId?: string | null;
  pricingModule?: PricingModule | null;
  payments?: Payment[];
};

export type Lead = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  source: string;
  status: string;
  desiredSpaceId?: string | null;
  desiredSpace?: Space | null;
  createdAt: string;
};

export type Payment = {
  id: string;
  bookingId: string;
  userId?: string | null;
  amount: string | number;
  currency: string;
  method: string;
  status: string;
  paidAt?: string | null;
  booking?: Booking;
  user?: User | null;
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  createdAt: string;
  user?: User | null;
};


export type AdminMetrics = {
  activeSpaces: number;
  totalUsers: number;
  newLeads: number;
  activeBookings: number;
  approvedRevenue: number;
};

export type AdminSummaryDashboard = {
  metrics: AdminMetrics;
  recentBookings: Booking[];
  recentLeads: Lead[];
};

export type AdminDashboard = {
  metrics: AdminMetrics;
  spaces: Space[];
  users: User[];
  leads: Lead[];
  bookings: Booking[];
  payments: Payment[];
  auditLogs: AuditLog[];
  recurringRules: RecurringBookingRule[];
  availabilityBlocks: AvailabilityBlock[];
  availabilityRules: (AvailabilityRule & { space?: Space })[];
  pricingModules: PricingModule[];
};

export type MercadoPagoPreferenceRequest = {
  title: string;
  amount: number;
  description?: string;
  externalReference?: string;
  payerEmail?: string;
  metadata?: Record<string, unknown>;
};

export type MercadoPagoPreferenceResponse = {
  id: string;
  initPoint?: string;
  sandboxInitPoint?: string;
};

export type PricingModulePayload = {
  spaceId: string;
  name: string;
  slug?: string;
  description?: string | null;
  moduleType: PricingModuleType;
  durationHours?: number | null;
  weeklyHours?: number | null;
  pricePerHour: number;
  totalPrice?: number;
  sortOrder?: number;
  isActive?: boolean;
};
