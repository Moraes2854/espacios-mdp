import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, BookingType, DayOfWeek, Prisma } from '@prisma/client';
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

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function minutesFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

function addHours(date: Date, hours: number) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
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

  async create(data: {
    spaceId: string;
    userId?: string;
    professionalProfileId?: string;
    pricingModuleId?: string;
    startAt: string;
    endAt?: string;
    bookingType?: BookingType;
    status?: BookingStatus;
    notes?: string;
  }) {
    let startAt = new Date(data.startAt);
    let endAt = data.endAt ? new Date(data.endAt) : undefined;

    if (Number.isNaN(startAt.getTime()) || (endAt && Number.isNaN(endAt.getTime()))) {
      throw new BadRequestException('startAt y endAt deben ser fechas válidas.');
    }

    const space = await this.prisma.space.findUnique({
      where: { id: data.spaceId },
      include: { availabilityRules: { where: { isActive: true } } },
    });

    if (!space) {
      throw new NotFoundException('Espacio no encontrado.');
    }

    let pricingModule = data.pricingModuleId
      ? await this.prisma.pricingModule.findUnique({ where: { id: data.pricingModuleId } })
      : null;

    if (data.pricingModuleId && !pricingModule) {
      throw new NotFoundException('Módulo de precio no encontrado.');
    }

    if (!endAt && pricingModule?.durationHours) {
      endAt = addHours(startAt, pricingModule.durationHours);
    }

    if (!endAt && pricingModule?.weeklyHours) {
      endAt = addHours(startAt, pricingModule.weeklyHours);
    }

    if (!endAt) {
      throw new BadRequestException('Debe indicarse endAt o seleccionar un módulo con duración.');
    }

    if (endAt <= startAt) {
      throw new BadRequestException('La fecha/hora de fin debe ser posterior al inicio.');
    }

    if (startAt.getMinutes() !== 0 || endAt.getMinutes() !== 0) {
      throw new BadRequestException('Las reservas deben comenzar y terminar en hora exacta.');
    }

    const hours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
    if (!Number.isInteger(hours) || hours < 1) {
      throw new BadRequestException('La duración debe ser de una o más horas completas.');
    }

    if (!pricingModule) {
      pricingModule = await this.prisma.pricingModule.findFirst({
        where: { isActive: true, durationHours: hours },
        orderBy: { sortOrder: 'asc' },
      });
    }

    if (pricingModule?.durationHours && pricingModule.durationHours !== hours) {
      throw new BadRequestException(`El módulo seleccionado requiere ${pricingModule.durationHours} horas corridas.`);
    }

    if (pricingModule?.weeklyHours && pricingModule.weeklyHours !== hours) {
      throw new BadRequestException(`El módulo semanal seleccionado requiere ${pricingModule.weeklyHours} horas.`);
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

    const overlappingBooking = await this.prisma.booking.findFirst({
      where: {
        spaceId: data.spaceId,
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
        spaceId: data.spaceId,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });

    if (overlappingBlock) {
      throw new BadRequestException('El horario seleccionado está bloqueado por mantenimiento, uso interno u otro bloqueo.');
    }

    const pricePerHour = pricingModule
      ? new Prisma.Decimal(pricingModule.pricePerHour.toString())
      : new Prisma.Decimal(space.baseHourlyPrice.toString());
    const totalPrice = pricingModule
      ? new Prisma.Decimal(pricingModule.totalPrice.toString())
      : pricePerHour.mul(hours);

    const booking = await this.prisma.booking.create({
      data: {
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
      },
      include: { space: true, user: true, professionalProfile: true, payments: true, pricingModule: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: 'CREATE_BOOKING',
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
      },
    });

    return booking;
  }
}
