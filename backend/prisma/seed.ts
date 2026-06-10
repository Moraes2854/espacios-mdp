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
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const pricingModules = [
  {
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
    name: '2 horas corridas',
    slug: '2-horas-corridas',
    description: 'Bloque de 2 horas corridas.',
    moduleType: PricingModuleType.CONTINUOUS_BLOCK,
    durationHours: 2,
    weeklyHours: null,
    pricePerHour: 7000,
    totalPrice: 14000,
    sortOrder: 20,
  },
  {
    name: '3 horas corridas',
    slug: '3-horas-corridas',
    description: 'Bloque de 3 horas corridas.',
    moduleType: PricingModuleType.CONTINUOUS_BLOCK,
    durationHours: 3,
    weeklyHours: null,
    pricePerHour: 7000,
    totalPrice: 21000,
    sortOrder: 30,
  },
  {
    name: '4 horas corridas',
    slug: '4-horas-corridas',
    description: 'Bloque de 4 horas corridas.',
    moduleType: PricingModuleType.CONTINUOUS_BLOCK,
    durationHours: 4,
    weeklyHours: null,
    pricePerHour: 6500,
    totalPrice: 26000,
    sortOrder: 40,
  },
  {
    name: '5 horas corridas',
    slug: '5-horas-corridas',
    description: 'Bloque de 5 horas corridas.',
    moduleType: PricingModuleType.CONTINUOUS_BLOCK,
    durationHours: 5,
    weeklyHours: null,
    pricePerHour: 6500,
    totalPrice: 32500,
    sortOrder: 50,
  },
  {
    name: '6 horas corridas',
    slug: '6-horas-corridas',
    description: 'Bloque de 6 horas corridas.',
    moduleType: PricingModuleType.CONTINUOUS_BLOCK,
    durationHours: 6,
    weeklyHours: null,
    pricePerHour: 6500,
    totalPrice: 39000,
    sortOrder: 60,
  },
  {
    name: '7 horas corridas',
    slug: '7-horas-corridas',
    description: 'Bloque de 7 horas corridas.',
    moduleType: PricingModuleType.CONTINUOUS_BLOCK,
    durationHours: 7,
    weeklyHours: null,
    pricePerHour: 6500,
    totalPrice: 45500,
    sortOrder: 70,
  },
  {
    name: '8 horas por semana',
    slug: '8-horas-por-semana',
    description: 'Pack semanal recurrente de 8 horas. Pensado para uso fijo o recurrente.',
    moduleType: PricingModuleType.WEEKLY_PACK,
    durationHours: null,
    weeklyHours: 8,
    pricePerHour: 5500,
    totalPrice: 44000,
    sortOrder: 80,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@espaciosmdp.com' },
    update: {
      firstName: 'Santiago',
      lastName: 'Moraes',
      phone: '2235196273',
      role: UserRole.ADMIN,
    },
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
    update: {
      firstName: 'Cliente',
      lastName: 'Demo',
      phone: '2235196273',
      role: UserRole.PROFESSIONAL,
    },
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
    update: {
      displayName: 'Cliente Demo',
      profession: 'Consultor',
      billingEmail: 'cliente.demo@espaciosmdp.com',
    },
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

  for (const moduleData of pricingModules) {
    await prisma.pricingModule.upsert({
      where: { slug: moduleData.slug },
      update: moduleData,
      create: moduleData,
    });
  }

  const spaces = [
    {
      name: 'Consultorio privado',
      slug: 'consultorio-privado',
      description: 'Ambiente privado y cómodo para atención individual, entrevistas, reuniones breves o sesiones profesionales.',
      capacity: 2,
      baseHourlyPrice: 7500,
      recurrentHourlyPrice: 6500,
      cover: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200&auto=format&fit=crop',
      amenities: ['Wi-Fi', 'Limpieza incluida', 'Sillones', 'Luz cálida', 'Ambiente privado'],
    },
    {
      name: 'Sala profesional',
      slug: 'sala-profesional',
      description: 'Sala equipada para reuniones, presentaciones, entrevistas, capacitaciones o trabajo de equipos pequeños.',
      capacity: 6,
      baseHourlyPrice: 7500,
      recurrentHourlyPrice: 6500,
      cover: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop',
      amenities: ['Mesa de reunión', 'Pantalla', 'Pizarra', 'Wi-Fi', 'Climatización'],
    },
    {
      name: 'Espacio flexible',
      slug: 'espacio-flexible',
      description: 'Espacio adaptable para trabajo remoto, llamadas, mentorías, asesorías o reuniones uno a uno.',
      capacity: 3,
      baseHourlyPrice: 7500,
      recurrentHourlyPrice: 6500,
      cover: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
      amenities: ['Escritorio', 'Wi-Fi', 'Luz natural', 'Zona de café', 'Limpieza incluida'],
    },
  ];

  for (const spaceData of spaces) {
    const space = await prisma.space.upsert({
      where: { slug: spaceData.slug },
      update: {
        name: spaceData.name,
        description: spaceData.description,
        capacity: spaceData.capacity,
        baseHourlyPrice: spaceData.baseHourlyPrice,
        recurrentHourlyPrice: spaceData.recurrentHourlyPrice,
        address: 'Centro, Mar del Plata',
        floor: 'A definir',
      },
      create: {
        name: spaceData.name,
        slug: spaceData.slug,
        description: spaceData.description,
        capacity: spaceData.capacity,
        baseHourlyPrice: spaceData.baseHourlyPrice,
        recurrentHourlyPrice: spaceData.recurrentHourlyPrice,
        address: 'Centro, Mar del Plata',
        floor: 'A definir',
      },
    });

    await prisma.spaceAmenity.deleteMany({ where: { spaceId: space.id } });
    await prisma.spaceImage.deleteMany({ where: { spaceId: space.id } });
    await prisma.availabilityRule.deleteMany({ where: { spaceId: space.id } });

    await prisma.spaceImage.create({
      data: {
        spaceId: space.id,
        url: spaceData.cover,
        alt: spaceData.name,
        position: 0,
        isCover: true,
      },
    });

    for (const [index, amenity] of spaceData.amenities.entries()) {
      await prisma.spaceAmenity.create({
        data: { spaceId: space.id, name: amenity, position: index },
      });
    }

    for (const dayOfWeek of [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY]) {
      await prisma.availabilityRule.create({
        data: {
          spaceId: space.id,
          dayOfWeek,
          startTime: '08:00',
          endTime: '19:00',
        },
      });
    }

    await prisma.availabilityRule.create({
      data: {
        spaceId: space.id,
        dayOfWeek: DayOfWeek.SATURDAY,
        startTime: '09:00',
        endTime: '13:00',
      },
    });
  }

  const consultorio = await prisma.space.findUniqueOrThrow({ where: { slug: 'consultorio-privado' } });
  const sala = await prisma.space.findUniqueOrThrow({ where: { slug: 'sala-profesional' } });
  const oneHour = await prisma.pricingModule.findUniqueOrThrow({ where: { slug: '1-hora' } });
  const twoHours = await prisma.pricingModule.findUniqueOrThrow({ where: { slug: '2-horas-corridas' } });

  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.recurringBookingRule.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.availabilityBlock.deleteMany({ where: { source: AvailabilityBlockSource.MAINTENANCE } });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 0, 0, 0);

  const booking = await prisma.booking.create({
    data: {
      spaceId: consultorio.id,
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
      spaceId: consultorio.id,
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
      spaceId: sala.id,
      startAt: blockStart,
      endAt: blockEnd,
      reason: 'Mantenimiento / limpieza profunda',
      source: AvailabilityBlockSource.MAINTENANCE,
    },
  });

  await prisma.lead.create({
    data: {
      name: 'Consulta Web Demo',
      phone: '2235196273',
      email: 'consulta.demo@mail.com',
      message: 'Quisiera consultar disponibilidad para usar un espacio profesional por hora.',
      source: LeadSource.WEB,
      status: LeadStatus.NEW,
      desiredSpaceId: consultorio.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SEED_DATABASE',
      entityType: 'System',
      metadata: { source: 'prisma/seed.ts', pricingModules: pricingModules.length },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
