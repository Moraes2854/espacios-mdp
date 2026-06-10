import { AdminDashboard, Booking, PricingModule, Space, SpaceAvailabilityCalendar, User } from './types';

export const fallbackPricingModules: PricingModule[] = [
  { id: 'pm-1h', name: '1 hora', slug: '1-hora', description: 'Reserva puntual de una hora.', moduleType: 'SINGLE', durationHours: 1, weeklyHours: null, pricePerHour: 7500, totalPrice: 7500, isActive: true, sortOrder: 10 },
  { id: 'pm-2h', name: '2 horas corridas', slug: '2-horas-corridas', description: 'Bloque de 2 horas corridas.', moduleType: 'CONTINUOUS_BLOCK', durationHours: 2, weeklyHours: null, pricePerHour: 7000, totalPrice: 14000, isActive: true, sortOrder: 20 },
  { id: 'pm-3h', name: '3 horas corridas', slug: '3-horas-corridas', description: 'Bloque de 3 horas corridas.', moduleType: 'CONTINUOUS_BLOCK', durationHours: 3, weeklyHours: null, pricePerHour: 7000, totalPrice: 21000, isActive: true, sortOrder: 30 },
  { id: 'pm-4h', name: '4 horas corridas', slug: '4-horas-corridas', description: 'Bloque de 4 horas corridas.', moduleType: 'CONTINUOUS_BLOCK', durationHours: 4, weeklyHours: null, pricePerHour: 6500, totalPrice: 26000, isActive: true, sortOrder: 40 },
  { id: 'pm-5h', name: '5 horas corridas', slug: '5-horas-corridas', description: 'Bloque de 5 horas corridas.', moduleType: 'CONTINUOUS_BLOCK', durationHours: 5, weeklyHours: null, pricePerHour: 6500, totalPrice: 32500, isActive: true, sortOrder: 50 },
  { id: 'pm-6h', name: '6 horas corridas', slug: '6-horas-corridas', description: 'Bloque de 6 horas corridas.', moduleType: 'CONTINUOUS_BLOCK', durationHours: 6, weeklyHours: null, pricePerHour: 6500, totalPrice: 39000, isActive: true, sortOrder: 60 },
  { id: 'pm-7h', name: '7 horas corridas', slug: '7-horas-corridas', description: 'Bloque de 7 horas corridas.', moduleType: 'CONTINUOUS_BLOCK', durationHours: 7, weeklyHours: null, pricePerHour: 6500, totalPrice: 45500, isActive: true, sortOrder: 70 },
  { id: 'pm-8w', name: '8 horas por semana', slug: '8-horas-por-semana', description: 'Pack semanal recurrente de 8 horas.', moduleType: 'WEEKLY_PACK', durationHours: null, weeklyHours: 8, pricePerHour: 5500, totalPrice: 44000, isActive: true, sortOrder: 80 },
];

export const fallbackSpaces: Space[] = [
  {
    id: 'space-consultorio',
    name: 'Consultorio privado',
    slug: 'consultorio-privado',
    description: 'Ambiente privado y cómodo para atención individual, entrevistas, reuniones breves o sesiones profesionales.',
    capacity: 2,
    isActive: true,
    address: 'Centro, Mar del Plata',
    baseHourlyPrice: 7500,
    recurrentHourlyPrice: 6500,
    amenities: [
      { id: 'a1', name: 'Wi-Fi', position: 1 },
      { id: 'a2', name: 'Limpieza incluida', position: 2 },
      { id: 'a3', name: 'Ambiente privado', position: 3 },
    ],
    images: [{ id: 'img1', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200&auto=format&fit=crop', isCover: true, position: 0 }],
  },
  {
    id: 'space-sala',
    name: 'Sala profesional',
    slug: 'sala-profesional',
    description: 'Sala equipada para reuniones, presentaciones, entrevistas, capacitaciones o trabajo de equipos pequeños.',
    capacity: 6,
    isActive: true,
    address: 'Centro, Mar del Plata',
    baseHourlyPrice: 7500,
    recurrentHourlyPrice: 6500,
    amenities: [
      { id: 'a4', name: 'Pantalla', position: 1 },
      { id: 'a5', name: 'Mesa de reunión', position: 2 },
      { id: 'a6', name: 'Pizarra', position: 3 },
    ],
    images: [{ id: 'img2', url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop', isCover: true, position: 0 }],
  },
  {
    id: 'space-flex',
    name: 'Espacio flexible',
    slug: 'espacio-flexible',
    description: 'Espacio adaptable para trabajo remoto, llamadas, mentorías, asesorías o reuniones uno a uno.',
    capacity: 3,
    isActive: true,
    address: 'Centro, Mar del Plata',
    baseHourlyPrice: 7500,
    recurrentHourlyPrice: 6500,
    amenities: [
      { id: 'a7', name: 'Escritorio', position: 1 },
      { id: 'a8', name: 'Luz natural', position: 2 },
      { id: 'a9', name: 'Zona de café', position: 3 },
    ],
    images: [{ id: 'img3', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop', isCover: true, position: 0 }],
  },
];

export const fallbackUser: User = {
  id: 'user-demo',
  email: 'cliente.demo@espaciosmdp.com',
  firstName: 'Cliente',
  lastName: 'Demo',
  phone: '2235196273',
  role: 'PROFESSIONAL',
  professionalProfile: {
    id: 'profile-demo',
    userId: 'user-demo',
    displayName: 'Cliente Demo',
    profession: 'Consultor',
    taxCondition: 'MONOTRIBUTO',
    billingEmail: 'cliente.demo@espaciosmdp.com',
  },
};

export const fallbackBookings: Booking[] = [
  {
    id: 'booking-demo-1',
    spaceId: 'space-consultorio',
    userId: 'user-demo',
    professionalProfileId: 'profile-demo',
    pricingModuleId: 'pm-1h',
    pricingModule: fallbackPricingModules[0],
    startAt: new Date(Date.now() + 86400000).toISOString(),
    endAt: new Date(Date.now() + 90000000).toISOString(),
    status: 'CONFIRMED',
    bookingType: 'ONE_TIME',
    pricePerHour: 7500,
    totalPrice: 7500,
    space: fallbackSpaces[0],
    payments: [{ id: 'payment-demo-1', bookingId: 'booking-demo-1', amount: 7500, currency: 'ARS', method: 'BANK_TRANSFER', status: 'APPROVED' }],
  },
];

const fallbackRecurringRules = [
  {
    id: 'recurring-demo',
    professionalProfileId: 'profile-demo',
    spaceId: 'space-consultorio',
    dayOfWeek: 'TUESDAY',
    startTime: '15:00',
    endTime: '17:00',
    startsOn: new Date().toISOString(),
    endsOn: new Date(Date.now() + 90 * 86400000).toISOString(),
    status: 'ACTIVE',
    pricePerHour: 7000,
    notes: 'Ejemplo de uso recurrente semanal',
    space: fallbackSpaces[0],
    professionalProfile: fallbackUser.professionalProfile!,
  },
];

const fallbackAvailabilityRules = fallbackSpaces.flatMap((space) => [
  ...['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => ({
    id: `${space.id}-${day}`,
    dayOfWeek: day,
    startTime: '08:00',
    endTime: '19:00',
    isActive: true,
    space,
  })),
  {
    id: `${space.id}-SATURDAY`,
    dayOfWeek: 'SATURDAY',
    startTime: '09:00',
    endTime: '13:00',
    isActive: true,
    space,
  },
]);

const fallbackAvailabilityBlocks = [
  {
    id: 'block-demo',
    startAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    endAt: new Date(Date.now() + 2 * 86400000 + 3600000).toISOString(),
    reason: 'Mantenimiento / limpieza profunda',
    source: 'MAINTENANCE',
    space: fallbackSpaces[1],
  },
];

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function toDateOnly(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export function buildFallbackCalendar(spaceId = fallbackSpaces[0].id, days = 7): SpaceAvailabilityCalendar[] {
  const space = fallbackSpaces.find((item) => item.id === spaceId) || fallbackSpaces[0];
  const calendarDays = Array.from({ length: days }).map((_, dayIndex) => {
    const date = new Date();
    date.setDate(date.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = dayNames[date.getDay()];
    const isSaturday = dayOfWeek === 'SATURDAY';
    const isSunday = dayOfWeek === 'SUNDAY';
    const startHour = isSaturday ? 9 : 8;
    const endHour = isSaturday ? 13 : 19;
    const slots = isSunday
      ? []
      : Array.from({ length: endHour - startHour }).map((__, index) => {
          const start = new Date(date);
          start.setHours(startHour + index, 0, 0, 0);
          const end = new Date(start);
          end.setHours(end.getHours() + 1);
          return {
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            label: `${pad(start.getHours())}:00`,
            status: start < new Date() ? 'PAST' as const : 'AVAILABLE' as const,
          };
        });
    return { date: toDateOnly(date), dayOfWeek, isClosed: isSunday, slots };
  });
  return [{ spaceId: space.id, spaceName: space.name, days: calendarDays }];
}

export const fallbackAdminDashboard: AdminDashboard = {
  metrics: {
    activeSpaces: 3,
    totalUsers: 2,
    newLeads: 1,
    activeBookings: 1,
    approvedRevenue: 7500,
  },
  spaces: fallbackSpaces,
  users: [fallbackUser, { ...fallbackUser, id: 'admin-demo', email: 'admin@espaciosmdp.com', role: 'ADMIN', firstName: 'Santiago', lastName: 'Moraes' }],
  leads: [
    {
      id: 'lead-demo',
      name: 'Consulta Web Demo',
      email: 'consulta.demo@mail.com',
      phone: '2235196273',
      message: 'Quisiera consultar disponibilidad para usar un espacio profesional por hora.',
      source: 'WEB',
      status: 'NEW',
      createdAt: new Date().toISOString(),
      desiredSpace: fallbackSpaces[0],
    },
  ],
  bookings: fallbackBookings,
  payments: fallbackBookings[0].payments || [],
  auditLogs: [
    { id: 'audit-demo', action: 'SEED_DATABASE', entityType: 'System', createdAt: new Date().toISOString(), user: { ...fallbackUser, role: 'ADMIN' } },
  ],
  recurringRules: fallbackRecurringRules,
  availabilityBlocks: fallbackAvailabilityBlocks,
  availabilityRules: fallbackAvailabilityRules,
  pricingModules: fallbackPricingModules,
};
