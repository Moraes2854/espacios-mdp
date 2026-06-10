export type UserRole = 'ADMIN' | 'OPERATOR' | 'PROFESSIONAL';
export type SessionMode = 'public' | 'user' | 'admin';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  professionalProfile?: ProfessionalProfile | null;
};

export type ProfessionalProfile = {
  id: string;
  userId: string;
  displayName?: string;
  profession?: string;
  documentType?: string;
  documentNumber?: string;
  taxCondition?: string;
  billingEmail?: string;
  notes?: string;
};


export type PricingModule = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  moduleType: 'SINGLE' | 'CONTINUOUS_BLOCK' | 'WEEKLY_PACK';
  durationHours?: number | null;
  weeklyHours?: number | null;
  pricePerHour: string | number;
  totalPrice: string | number;
  isActive: boolean;
  sortOrder: number;
};

export type CalendarSlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'PAST';

export type CalendarSlot = {
  startAt: string;
  endAt: string;
  label: string;
  status: CalendarSlotStatus;
  bookingId?: string;
  bookingStatus?: string;
  blockReason?: string;
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

export type SpaceAmenity = {
  id: string;
  name: string;
  icon?: string;
  position: number;
};

export type SpaceImage = {
  id: string;
  url: string;
  alt?: string;
  isCover: boolean;
  position: number;
};

export type AvailabilityRule = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type AvailabilityBlock = {
  id: string;
  startAt: string;
  endAt: string;
  reason?: string;
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
  endsOn?: string;
  status: string;
  pricePerHour: string | number;
  notes?: string;
  space?: Space;
  professionalProfile?: ProfessionalProfile & { user?: User };
};

export type Space = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  capacity?: number;
  sizeM2?: number;
  floor?: string;
  address?: string;
  isActive: boolean;
  baseHourlyPrice: string | number;
  recurrentHourlyPrice?: string | number;
  amenities: SpaceAmenity[];
  images: SpaceImage[];
  availabilityRules?: AvailabilityRule[];
  availabilityBlocks?: AvailabilityBlock[];
  recurringRules?: RecurringBookingRule[];
};

export type Booking = {
  id: string;
  spaceId: string;
  userId?: string;
  professionalProfileId?: string;
  startAt: string;
  endAt: string;
  status: string;
  bookingType: string;
  pricePerHour: string | number;
  totalPrice: string | number;
  notes?: string;
  space?: Space;
  user?: User;
  professionalProfile?: ProfessionalProfile;
  pricingModuleId?: string;
  pricingModule?: PricingModule;
  payments?: Payment[];
};

export type Lead = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  status: string;
  desiredSpace?: Space;
  createdAt: string;
};

export type Payment = {
  id: string;
  bookingId: string;
  userId?: string;
  amount: string | number;
  currency: string;
  method: string;
  status: string;
  paidAt?: string;
  booking?: Booking;
  user?: User;
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  createdAt: string;
  user?: User;
};

export type AdminDashboard = {
  metrics: {
    activeSpaces: number;
    totalUsers: number;
    newLeads: number;
    activeBookings: number;
    approvedRevenue: number;
  };
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
