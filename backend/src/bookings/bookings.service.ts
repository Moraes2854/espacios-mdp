import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, BookingType, DayOfWeek, Prisma, PricingModule, PricingModuleType, Space } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const BLOCKING_BOOKING_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.PAID];

const jsDayToPrismaDay: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

type SpaceWithRules = Space & {
  availabilityRules: { dayOfWeek: DayOfWeek; startTime: string; endTime: string; isActive: boolean }[];
};

type CreateBookingInput = {
  spaceId: string;
  userId?: string;
  professionalProfileId?: string;
  pricingModuleId?: string;
  startAt: string;
  endAt?: string;
  bookingType?: BookingType;
  status?: BookingStatus;
  notes?: string;
};

type WeeklyPackBlockInput = {
  startAt: string;
  endAt: string;
};

type CreateWeeklyPackInput = {
  spaceId: string;
  userId?: string;
  professionalProfileId?: string;
  pricingModuleId: string;
  status?: BookingStatus;
  notes?: string;
  blocks: WeeklyPackBlockInput[];
};


type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    space: true;
    user: true;
    professionalProfile: true;
    payments: true;
    pricingModule: true;
  };
}>;

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function minutesFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function addHours(date: Date, hours: number) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function parseDate(value: string, fieldName: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${fieldName} debe ser una fecha válida.`);
  }
  return date;
}

function hoursBetween(startAt: Date, endAt: Date) {
  return (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: { userId?: string; status?: BookingStatus }) {
    return this.prisma.booking.findMany({
      where: {
        userId: query.userId,
        status: query.status,
      },
      orderBy: { startAt: 'asc' },
      include: {
        space: true,
        user: true,
        professionalProfile: true,
        payments: true,
        pricingModule: true,
      },
    });
  }

  async create(data: CreateBookingInput) {
    const space = await this.findSpaceOrThrow(data.spaceId);
    let pricingModule = await this.findPricingModule(data.pricingModuleId);

    let startAt = parseDate(data.startAt, 'startAt');
    let endAt = data.endAt ? parseDate(data.endAt, 'endAt') : undefined;

    if (!endAt && pricingModule?.durationHours) {
      endAt = addHours(startAt, pricingModule.durationHours);
    }

    if (!endAt && pricingModule?.weeklyHours) {
      endAt = addHours(startAt, pricingModule.durationHours || pricingModule.weeklyHours);
    }

    if (!endAt) {
      throw new BadRequestException('Debe indicarse endAt o seleccionar un módulo con duración.');
    }

    const hours = this.validateBookingWindow(space, startAt, endAt);

    if (!pricingModule) {
      pricingModule = await this.prisma.pricingModule.findFirst({
        where: { isActive: true, durationHours: hours },
        orderBy: { sortOrder: 'asc' },
      });
    }

    this.validatePricingModuleDuration(pricingModule, hours);
    await this.ensureNoOperationalOverlap(data.spaceId, startAt, endAt);

    const pricePerHour = pricingModule
      ? new Prisma.Decimal(pricingModule.pricePerHour.toString())
      : new Prisma.Decimal(space.baseHourlyPrice.toString());
    const totalPrice = pricingModule
      ? new Prisma.Decimal(pricingModule.totalPrice.toString())
      : pricePerHour.mul(hours);

    return this.createBookingRecord({
      spaceId: data.spaceId,
      userId: data.userId,
      professionalProfileId: data.professionalProfileId,
      pricingModuleId: pricingModule?.id,
      startAt,
      endAt,
      bookingType: data.bookingType || BookingType.ONE_TIME,
      status: data.status || BookingStatus.PENDING,
      pricePerHour,
      totalPrice,
      notes: data.notes,
      auditAction: 'CREATE_BOOKING',
    });
  }

  async createWeeklyPack(data: CreateWeeklyPackInput) {
    const space = await this.findSpaceOrThrow(data.spaceId);
    const pricingModule = await this.findPricingModule(data.pricingModuleId);

    if (!pricingModule) {
      throw new NotFoundException('Módulo de precio no encontrado.');
    }

    if (pricingModule.moduleType !== PricingModuleType.WEEKLY_PACK) {
      throw new BadRequestException('El módulo seleccionado no es un pack semanal.');
    }

    const blockHours = pricingModule.durationHours || 4;
    const weeklyHours = pricingModule.weeklyHours || blockHours;
    const requiredBlocks = Math.ceil(weeklyHours / blockHours);

    if (!data.blocks?.length || data.blocks.length !== requiredBlocks) {
      throw new BadRequestException(`El pack semanal requiere ${requiredBlocks} bloques de ${blockHours} horas.`);
    }

    const parsedBlocks = data.blocks.map((block) => {
      const startAt = parseDate(block.startAt, 'startAt');
      const endAt = parseDate(block.endAt, 'endAt');
      const hours = this.validateBookingWindow(space, startAt, endAt);

      if (hours !== blockHours) {
        throw new BadRequestException(`Cada bloque del pack semanal debe durar ${blockHours} horas.`);
      }

      return { startAt, endAt };
    });

    const uniqueDays = new Set(parsedBlocks.map((block) => dateKey(block.startAt)));
    if (uniqueDays.size !== parsedBlocks.length) {
      throw new BadRequestException('El pack semanal debe reservarse en días distintos.');
    }

    for (const block of parsedBlocks) {
      await this.ensureNoOperationalOverlap(data.spaceId, block.startAt, block.endAt);
    }

    const packGroupId = `weekly-pack-${Date.now()}`;
    const blockTotalPrice = new Prisma.Decimal(pricingModule.totalPrice.toString()).div(requiredBlocks);
    const pricePerHour = new Prisma.Decimal(pricingModule.pricePerHour.toString());

    const bookings: BookingWithRelations[] = [];
    for (let index = 0; index < parsedBlocks.length; index += 1) {
      const block = parsedBlocks[index];
      const booking = await this.createBookingRecord({
        spaceId: data.spaceId,
        userId: data.userId,
        professionalProfileId: data.professionalProfileId,
        pricingModuleId: pricingModule.id,
        startAt: block.startAt,
        endAt: block.endAt,
        bookingType: BookingType.RECURRENT,
        status: data.status || BookingStatus.PENDING,
        pricePerHour,
        totalPrice: blockTotalPrice,
        notes: [
          data.notes,
          `Pack semanal ${packGroupId}. Bloque ${index + 1}/${requiredBlocks}. Precio total del pack: ${pricingModule.totalPrice.toString()}.`,
        ].filter(Boolean).join(' '),
        auditAction: 'CREATE_WEEKLY_PACK_BOOKING',
        auditMetadata: {
          packGroupId,
          blockIndex: index + 1,
          requiredBlocks,
          weeklyHours,
          blockHours,
        },
      });
      bookings.push(booking);
    }

    return bookings;
  }

  private async findSpaceOrThrow(spaceId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: { availabilityRules: { where: { isActive: true } } },
    });

    if (!space) {
      throw new NotFoundException('Espacio no encontrado.');
    }

    return space;
  }

  private async findPricingModule(pricingModuleId?: string) {
    if (!pricingModuleId) return null;

    const pricingModule = await this.prisma.pricingModule.findUnique({ where: { id: pricingModuleId } });
    if (!pricingModule) {
      throw new NotFoundException('Módulo de precio no encontrado.');
    }

    return pricingModule;
  }

  private validateBookingWindow(space: SpaceWithRules, startAt: Date, endAt: Date) {
    if (endAt <= startAt) {
      throw new BadRequestException('La fecha/hora de fin debe ser posterior al inicio.');
    }

    if (startAt.getMinutes() !== 0 || endAt.getMinutes() !== 0) {
      throw new BadRequestException('Las reservas deben comenzar y terminar en hora exacta.');
    }

    const hours = hoursBetween(startAt, endAt);
    if (!Number.isInteger(hours) || hours < 1) {
      throw new BadRequestException('La duración debe ser de una o más horas completas.');
    }

    const sameDay = startAt.toDateString() === endAt.toDateString();
    if (!sameDay) {
      throw new BadRequestException('Por ahora las reservas deben realizarse dentro del mismo día.');
    }

    const dayOfWeek = jsDayToPrismaDay[startAt.getDay()];
    const startMinutes = minutesFromDate(startAt);
    const endMinutes = minutesFromDate(endAt);
    const insideOpeningHours = space.availabilityRules.some((rule) => {
      return rule.dayOfWeek === dayOfWeek && startMinutes >= timeToMinutes(rule.startTime) && endMinutes <= timeToMinutes(rule.endTime);
    });

    if (!insideOpeningHours) {
      throw new BadRequestException('El horario seleccionado está fuera del horario de apertura del espacio.');
    }

    return hours;
  }

  private validatePricingModuleDuration(pricingModule: PricingModule | null, hours: number) {
    if (pricingModule?.durationHours && pricingModule.durationHours !== hours) {
      throw new BadRequestException(`El módulo seleccionado requiere ${pricingModule.durationHours} horas.`);
    }

    if (pricingModule?.weeklyHours && !pricingModule.durationHours && pricingModule.weeklyHours !== hours) {
      throw new BadRequestException(`El módulo semanal seleccionado requiere ${pricingModule.weeklyHours} horas.`);
    }

    if (pricingModule?.weeklyHours && pricingModule.durationHours && pricingModule.durationHours !== hours) {
      throw new BadRequestException(`El módulo semanal seleccionado se reserva en bloques de ${pricingModule.durationHours} horas.`);
    }
  }

  private async ensureNoOperationalOverlap(spaceId: string, startAt: Date, endAt: Date) {
    const overlappingBooking = await this.prisma.booking.findFirst({
      where: {
        spaceId,
        status: { in: BLOCKING_BOOKING_STATUSES },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });

    if (overlappingBooking) {
      throw new BadRequestException('El horario seleccionado se superpone con otra reserva.');
    }

    const overlappingBlock = await this.prisma.availabilityBlock.findFirst({
      where: {
        spaceId,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });

    if (overlappingBlock) {
      throw new BadRequestException('El horario seleccionado está bloqueado por mantenimiento, uso interno u otro bloqueo.');
    }
  }

  private async createBookingRecord(data: {
    spaceId: string;
    userId?: string;
    professionalProfileId?: string;
    pricingModuleId?: string;
    startAt: Date;
    endAt: Date;
    bookingType: BookingType;
    status: BookingStatus;
    pricePerHour: Prisma.Decimal;
    totalPrice: Prisma.Decimal;
    notes?: string;
    auditAction: string;
    auditMetadata?: Prisma.InputJsonValue;
  }): Promise<BookingWithRelations> {
    const booking = await this.prisma.booking.create({
      data: {
        spaceId: data.spaceId,
        userId: data.userId,
        professionalProfileId: data.professionalProfileId,
        pricingModuleId: data.pricingModuleId,
        startAt: data.startAt,
        endAt: data.endAt,
        bookingType: data.bookingType,
        status: data.status,
        pricePerHour: data.pricePerHour,
        totalPrice: data.totalPrice,
        notes: data.notes,
      },
      include: { space: true, user: true, professionalProfile: true, payments: true, pricingModule: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.auditAction,
        entityType: 'Booking',
        entityId: booking.id,
        after: {
          id: booking.id,
          status: booking.status,
          spaceId: booking.spaceId,
          startAt: booking.startAt,
          endAt: booking.endAt,
          pricingModuleId: booking.pricingModuleId,
          totalPrice: booking.totalPrice,
        },
        metadata: data.auditMetadata,
      },
    });

    return booking;
  }
}
