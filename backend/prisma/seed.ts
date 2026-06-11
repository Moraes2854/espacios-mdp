import {
  AvailabilityBlockSource,
  BookingStatus,
  BookingType,
  DayOfWeek,
  LeadSource,
  LeadStatus,
  PaymentMethod,
  PaymentStatus,
  PricingModuleType,
  PrismaClient,
  RecurringRuleStatus,
  TaxCondition,
  UserRole,
} from '@prisma/client';
import type { Amenity, Space } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADDRESS = 'Rivadavia 3174, Mar del Plata, Buenos Aires';


type SeedAmenity = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  category: string;
  sortOrder: number;
};

type SpaceAmenityAssignment = {
  slug: string;
  note?: string;
  isHighlighted?: boolean;
};

const seedAmenities: SeedAmenity[] = [
  {
    name: 'WiFi',
    slug: 'wifi',
    icon: 'wifi',
    description: 'Internet incluido para trabajar, atender o reunirse durante la reserva.',
    category: 'Conectividad',
    sortOrder: 10,
  },
  {
    name: 'Climatización',
    slug: 'climatizacion',
    icon: 'ac_unit',
    description: 'Aire frío/calor para mantener el espacio cómodo durante todo el año.',
    category: 'Confort',
    sortOrder: 20,
  },
  {
    name: 'Limpieza incluida',
    slug: 'limpieza-incluida',
    icon: 'cleaning_services',
    description: 'Limpieza contemplada dentro del servicio del espacio.',
    category: 'Operación',
    sortOrder: 30,
  },
  {
    name: 'Ambiente privado',
    slug: 'ambiente-privado',
    icon: 'meeting_room',
    description: 'Espacio reservado para uso privado durante el horario contratado.',
    category: 'Privacidad',
    sortOrder: 40,
  },
  {
    name: 'Escritorio',
    slug: 'escritorio',
    icon: 'desk',
    description: 'Superficie de trabajo para notebook, documentación o atención profesional.',
    category: 'Equipamiento',
    sortOrder: 50,
  },
  {
    name: 'Sillones / sillas',
    slug: 'sillones-sillas',
    icon: 'chair',
    description: 'Asientos para atención, reuniones o trabajo individual.',
    category: 'Equipamiento',
    sortOrder: 60,
  },
  {
    name: 'Luz natural',
    slug: 'luz-natural',
    icon: 'wb_sunny',
    description: 'Iluminación natural para una experiencia más cálida y cómoda.',
    category: 'Confort',
    sortOrder: 70,
  },
  {
    name: 'Café',
    slug: 'cafe',
    icon: 'local_cafe',
    description: 'Servicio básico de café sujeto a disponibilidad operativa.',
    category: 'Confort',
    sortOrder: 80,
  },
  {
    name: 'Acceso digital',
    slug: 'acceso-digital',
    icon: 'key',
    description: 'Instrucciones digitales de ingreso para facilitar el uso del espacio.',
    category: 'Acceso',
    sortOrder: 90,
  },
  {
    name: 'Cerradura inteligente',
    slug: 'cerradura-inteligente',
    icon: 'lock',
    description: 'Preparado para operación con código, QR o sistema de acceso digital.',
    category: 'Acceso',
    sortOrder: 100,
  },
  {
    name: 'Seguridad en ingreso',
    slug: 'seguridad-en-ingreso',
    icon: 'security',
    description: 'Control de ingreso y medidas de seguridad en áreas comunes.',
    category: 'Seguridad',
    sortOrder: 110,
  },
  {
    name: 'Cámara en ingreso',
    slug: 'camara-en-ingreso',
    icon: 'videocam',
    description: 'Cámara solo en ingreso o áreas comunes. Nunca dentro del espacio privado.',
    category: 'Seguridad',
    sortOrder: 120,
  },
  {
    name: 'Baño',
    slug: 'bano',
    icon: 'wc',
    description: 'Baño disponible en el edificio o sector común.',
    category: 'Servicios',
    sortOrder: 130,
  },
  {
    name: 'Ascensor',
    slug: 'ascensor',
    icon: 'elevator',
    description: 'Acceso por ascensor según disponibilidad del edificio.',
    category: 'Accesibilidad',
    sortOrder: 140,
  },
  {
    name: 'Monitor',
    slug: 'monitor',
    icon: 'monitor',
    description: 'Monitor disponible para reuniones, presentaciones o trabajo.',
    category: 'Equipamiento',
    sortOrder: 150,
  },
];

const defaultAmenityAssignments: SpaceAmenityAssignment[] = [
  { slug: 'wifi', note: 'Internet incluido.', isHighlighted: true },
  { slug: 'climatizacion', note: 'Aire frío/calor.', isHighlighted: true },
  { slug: 'limpieza-incluida', note: 'Limpieza incluida en el servicio.', isHighlighted: true },
  { slug: 'ambiente-privado', note: 'Uso privado durante la reserva.', isHighlighted: true },
  { slug: 'escritorio' },
  { slug: 'sillones-sillas' },
  { slug: 'luz-natural' },
  { slug: 'acceso-digital' },
  { slug: 'cerradura-inteligente' },
  { slug: 'seguridad-en-ingreso' },
  { slug: 'camara-en-ingreso', note: 'Solo en ingreso o áreas comunes.' },
  { slug: 'bano' },
  { slug: 'ascensor' },
];

const amenityAssignmentsBySpaceSlug: Record<string, SpaceAmenityAssignment[]> = {
  'oficina-consultorio-rivadavia-3174-piso-1-oficina-14': defaultAmenityAssignments,
  'oficina-consultorio-rivadavia-3174-piso-2-oficina-22': [
    ...defaultAmenityAssignments,
    { slug: 'monitor', note: 'Disponible para reuniones o trabajo.' },
  ],
};

const seedSpaces = [
  {
    name: 'Oficina / consultorio privado · Piso 1 Oficina 14',
    slug: 'oficina-consultorio-rivadavia-3174-piso-1-oficina-14',
    description: 'Oficina privada para atención profesional, reuniones, entrevistas, sesiones, asesorías o trabajo por hora.',
    capacity: 2,
    baseHourlyPrice: 7500,
    recurrentHourlyPrice: 6500,
    address: ADDRESS,
    floor: 'Piso 1 · Oficina 14',
    imageAlt: 'Oficina / consultorio privado en Rivadavia 3174, Piso 1, Oficina 14',
  },
  {
    name: 'Oficina / consultorio privado · Piso 2 Oficina 22',
    slug: 'oficina-consultorio-rivadavia-3174-piso-2-oficina-22',
    description: 'Segunda oficina privada del mismo edificio, preparada para reservas por hora y módulos recurrentes.',
    capacity: 2,
    baseHourlyPrice: 7500,
    recurrentHourlyPrice: 6500,
    address: ADDRESS,
    floor: 'Piso 2 · Oficina 22',
    imageAlt: 'Oficina / consultorio privado en Rivadavia 3174, Piso 2, Oficina 22',
  },
];

function buildPricingModules(spaceId: string) {
  return [
    {
      spaceId,
      name: '1 hora',
      slug: '1-hora',
      description: 'Reserva puntual de una hora.',
      moduleType: PricingModuleType.SINGLE,
      durationHours: 1,
      weeklyHours: null,
      pricePerHour: 7500,
      totalPrice: 7500,
      sortOrder: 10,
    },
    {
      spaceId,
      name: '2 horas',
      slug: '2-horas-corridas',
      description: 'Bloque de 2 horas.',
      moduleType: PricingModuleType.CONTINUOUS_BLOCK,
      durationHours: 2,
      weeklyHours: null,
      pricePerHour: 7000,
      totalPrice: 14000,
      sortOrder: 20,
    },
    {
      spaceId,
      name: '3 horas',
      slug: '3-horas-corridas',
      description: 'Bloque de 3 horas.',
      moduleType: PricingModuleType.CONTINUOUS_BLOCK,
      durationHours: 3,
      weeklyHours: null,
      pricePerHour: 7000,
      totalPrice: 21000,
      sortOrder: 30,
    },
    {
      spaceId,
      name: '4 horas',
      slug: '4-horas-corridas',
      description: 'Bloque de 4 horas.',
      moduleType: PricingModuleType.CONTINUOUS_BLOCK,
      durationHours: 4,
      weeklyHours: null,
      pricePerHour: 6500,
      totalPrice: 26000,
      sortOrder: 40,
    },
    {
      spaceId,
      name: '5 horas',
      slug: '5-horas-corridas',
      description: 'Bloque de 5 horas.',
      moduleType: PricingModuleType.CONTINUOUS_BLOCK,
      durationHours: 5,
      weeklyHours: null,
      pricePerHour: 6500,
      totalPrice: 32500,
      sortOrder: 50,
    },
    {
      spaceId,
      name: '6 horas',
      slug: '6-horas-corridas',
      description: 'Bloque de 6 horas.',
      moduleType: PricingModuleType.CONTINUOUS_BLOCK,
      durationHours: 6,
      weeklyHours: null,
      pricePerHour: 6500,
      totalPrice: 39000,
      sortOrder: 60,
    },
    {
      spaceId,
      name: '7 horas',
      slug: '7-horas-corridas',
      description: 'Bloque de 7 horas.',
      moduleType: PricingModuleType.CONTINUOUS_BLOCK,
      durationHours: 7,
      weeklyHours: null,
      pricePerHour: 6500,
      totalPrice: 45500,
      sortOrder: 70,
    },
    {
      spaceId,
      name: '8 horas',
      slug: '8-horas-corridas',
      description: 'Bloque de 8 horas.',
      moduleType: PricingModuleType.CONTINUOUS_BLOCK,
      durationHours: 8,
      weeklyHours: null,
      pricePerHour: 5500,
      totalPrice: 44000,
      sortOrder: 80,
    },
    {
      spaceId,
      name: '8 horas semanales',
      slug: '8-horas-semanales',
      description: 'Pack semanal de 8 horas: dos bloques de 4 horas en días distintos de la misma semana.',
      moduleType: PricingModuleType.WEEKLY_PACK,
      durationHours: 4,
      weeklyHours: 8,
      pricePerHour: 5500,
      totalPrice: 44000,
      sortOrder: 90,
    },
  ];
}

async function createAvailabilityRules(spaceId: string) {
  for (const dayOfWeek of [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY]) {
    await prisma.availabilityRule.create({
      data: { spaceId, dayOfWeek, startTime: '08:00', endTime: '19:00' },
    });
  }

  await prisma.availabilityRule.create({
    data: { spaceId, dayOfWeek: DayOfWeek.SATURDAY, startTime: '09:00', endTime: '13:00' },
  });
}

async function upsertSeedAmenities() {
  const amenitiesBySlug: Record<string, Amenity> = {};

  for (const amenity of seedAmenities) {
    const savedAmenity = await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: {
        name: amenity.name,
        icon: amenity.icon,
        description: amenity.description,
        category: amenity.category,
        sortOrder: amenity.sortOrder,
        isActive: true,
      },
      create: {
        name: amenity.name,
        slug: amenity.slug,
        icon: amenity.icon,
        description: amenity.description,
        category: amenity.category,
        sortOrder: amenity.sortOrder,
        isActive: true,
      },
    });

    amenitiesBySlug[amenity.slug] = savedAmenity;
  }

  return amenitiesBySlug;
}

async function assignAmenitiesToSpace(
  spaceId: string,
  assignments: SpaceAmenityAssignment[],
  amenitiesBySlug: Record<string, Amenity>,
) {
  await prisma.spaceAmenity.deleteMany({ where: { spaceId } });

  for (const [index, assignment] of assignments.entries()) {
    const amenity = amenitiesBySlug[assignment.slug];

    if (!amenity) {
      throw new Error(`Amenity not found for slug: ${assignment.slug}`);
    }

    await prisma.spaceAmenity.create({
      data: {
        spaceId,
        amenityId: amenity.id,
        note: assignment.note,
        isHighlighted: assignment.isHighlighted ?? false,
        position: index,
      },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@espaciosmdp.com' },
    update: { firstName: 'Santiago', lastName: 'Moraes', phone: '2235196273', role: UserRole.ADMIN },
    create: {
      email: 'admin@espaciosmdp.com',
      passwordHash,
      firstName: 'Santiago',
      lastName: 'Moraes',
      phone: '2235196273',
      role: UserRole.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'cliente.demo@espaciosmdp.com' },
    update: { firstName: 'Cliente', lastName: 'Demo', phone: '2235196273', role: UserRole.PROFESSIONAL },
    create: {
      email: 'cliente.demo@espaciosmdp.com',
      passwordHash,
      firstName: 'Cliente',
      lastName: 'Demo',
      phone: '2235196273',
      role: UserRole.PROFESSIONAL,
    },
  });

  const profile = await prisma.professionalProfile.upsert({
    where: { userId: user.id },
    update: { displayName: 'Cliente Demo', profession: 'Consultor', billingEmail: 'cliente.demo@espaciosmdp.com' },
    create: {
      userId: user.id,
      displayName: 'Cliente Demo',
      profession: 'Consultor',
      documentType: 'DNI',
      documentNumber: '00000000',
      taxCondition: TaxCondition.MONOTRIBUTO,
      billingEmail: 'cliente.demo@espaciosmdp.com',
    },
  });

  const amenitiesBySlug = await upsertSeedAmenities();

  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.recurringBookingRule.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.availabilityBlock.deleteMany({});
  await prisma.pricingModule.deleteMany({});
  await prisma.availabilityRule.deleteMany({});
  await prisma.spaceAmenity.deleteMany({});
  await prisma.spaceImage.deleteMany({});
  await prisma.space.deleteMany({
    where: {
      slug: {
        in: ['consultorio-privado', 'sala-profesional', 'espacio-flexible', 'oficina-consultorio-rivadavia-3174'],
      },
    },
  });

  const createdSpaces: Space[] = [];

  for (const spaceData of seedSpaces) {
    const space = await prisma.space.upsert({
      where: { slug: spaceData.slug },
      update: {
        name: spaceData.name,
        description: spaceData.description,
        capacity: spaceData.capacity,
        baseHourlyPrice: spaceData.baseHourlyPrice,
        recurrentHourlyPrice: spaceData.recurrentHourlyPrice,
        address: spaceData.address,
        floor: spaceData.floor,
        isActive: true,
      },
      create: {
        name: spaceData.name,
        slug: spaceData.slug,
        description: spaceData.description,
        capacity: spaceData.capacity,
        baseHourlyPrice: spaceData.baseHourlyPrice,
        recurrentHourlyPrice: spaceData.recurrentHourlyPrice,
        address: spaceData.address,
        floor: spaceData.floor,
        isActive: true,
      },
    });

    createdSpaces.push(space);

    await prisma.spaceImage.create({
      data: {
        spaceId: space.id,
        url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200&auto=format&fit=crop',
        alt: spaceData.imageAlt,
        position: 0,
        isCover: true,
      },
    });

    await assignAmenitiesToSpace(
      space.id,
      amenityAssignmentsBySpaceSlug[spaceData.slug] ?? defaultAmenityAssignments,
      amenitiesBySlug,
    );
    await createAvailabilityRules(space.id);

    for (const moduleData of buildPricingModules(space.id)) {
      await prisma.pricingModule.upsert({
        where: { spaceId_slug: { spaceId: space.id, slug: moduleData.slug } },
        update: moduleData,
        create: moduleData,
      });
    }
  }

  const primarySpace = createdSpaces[0];
  const secondarySpace = createdSpaces[1];
  const oneHour = await prisma.pricingModule.findUniqueOrThrow({ where: { spaceId_slug: { spaceId: primarySpace.id, slug: '1-hora' } } });
  const twoHours = await prisma.pricingModule.findUniqueOrThrow({ where: { spaceId_slug: { spaceId: primarySpace.id, slug: '2-horas-corridas' } } });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 0, 0, 0);

  const booking = await prisma.booking.create({
    data: {
      spaceId: primarySpace.id,
      userId: user.id,
      professionalProfileId: profile.id,
      pricingModuleId: oneHour.id,
      startAt: tomorrow,
      endAt: tomorrowEnd,
      status: BookingStatus.CONFIRMED,
      bookingType: BookingType.ONE_TIME,
      pricePerHour: oneHour.pricePerHour,
      totalPrice: oneHour.totalPrice,
      notes: 'Reserva demo cargada por seed.',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId: user.id,
      amount: oneHour.totalPrice,
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.APPROVED,
      paidAt: new Date(),
    },
  });

  await prisma.recurringBookingRule.create({
    data: {
      professionalProfileId: profile.id,
      spaceId: primarySpace.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: '15:00',
      endTime: '17:00',
      startsOn: new Date(),
      endsOn: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: RecurringRuleStatus.ACTIVE,
      pricePerHour: twoHours.pricePerHour,
      notes: 'Ejemplo de reserva fija semanal.',
    },
  });

  const blockStart = new Date(now);
  blockStart.setDate(now.getDate() + 2);
  blockStart.setHours(12, 0, 0, 0);
  const blockEnd = new Date(blockStart);
  blockEnd.setHours(13, 0, 0, 0);

  await prisma.availabilityBlock.create({
    data: {
      spaceId: secondarySpace.id,
      startAt: blockStart,
      endAt: blockEnd,
      reason: 'Mantenimiento / limpieza profunda',
      source: AvailabilityBlockSource.MAINTENANCE,
    },
  });

  await prisma.lead.create({
    data: {
      name: 'Lead demo',
      email: 'lead@demo.com',
      phone: '2235196273',
      message: 'Estoy buscando un espacio profesional por hora en Mar del Plata.',
      source: LeadSource.WEB,
      status: LeadStatus.NEW,
      desiredSpaceId: primarySpace.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SEED_UPDATED',
      entityType: 'SYSTEM',
      metadata: {
        note: 'Seed actualizado con dos oficinas reales, módulos de precio por espacio y catálogo global de servicios incluidos.',
        spaces: seedSpaces.map((space) => `${space.address} · ${space.floor}`),
        amenities: seedAmenities.map((amenity) => amenity.slug),
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
