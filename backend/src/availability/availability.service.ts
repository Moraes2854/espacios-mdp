import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingStatus, DayOfWeek } from '@prisma/client';
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

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function toDateOnly(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes || 0, 0, 0);
  return result;
}

function addHours(date: Date, hours: number) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}


type AvailabilitySlotDto = {
  startAt: string;
  endAt: string;
  label: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'PAST';
  bookingId?: string;
  bookingStatus?: BookingStatus;
  blockReason?: string | null;
};

type CalendarDayDto = {
  date: string;
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  slots: AvailabilitySlotDto[];
};

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const spaces = await this.prisma.space.findMany({
      where: { isActive: true },
      include: {
        availabilityRules: true,
        availabilityBlocks: { orderBy: { startAt: 'asc' }, take: 10 },
        bookings: {
          where: {
            status: { in: BLOCKING_BOOKING_STATUSES },
            startAt: { gte: new Date() },
          },
          orderBy: { startAt: 'asc' },
          take: 10,
        },
      },
    });

    return spaces.map((space) => ({
      spaceId: space.id,
      spaceName: space.name,
      rules: space.availabilityRules,
      upcomingBlocks: space.availabilityBlocks,
      upcomingBookings: space.bookings,
    }));
  }

  async slots(query: { spaceId?: string; from?: string; days?: string }) {
    const days = Math.min(Math.max(Number(query.days || 7), 1), 31);
    const startDate = query.from ? new Date(`${query.from}T00:00:00`) : new Date();
    startDate.setHours(0, 0, 0, 0);

    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('El parámetro from debe tener formato YYYY-MM-DD.');
    }

    const rangeEnd = new Date(startDate);
    rangeEnd.setDate(rangeEnd.getDate() + days);

    const spaces = await this.prisma.space.findMany({
      where: { isActive: true, id: query.spaceId },
      include: {
        availabilityRules: { where: { isActive: true } },
        bookings: {
          where: {
            status: { in: BLOCKING_BOOKING_STATUSES },
            startAt: { lt: rangeEnd },
            endAt: { gt: startDate },
          },
          orderBy: { startAt: 'asc' },
          include: { user: true, pricingModule: true },
        },
        availabilityBlocks: {
          where: {
            startAt: { lt: rangeEnd },
            endAt: { gt: startDate },
          },
          orderBy: { startAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return spaces.map((space) => {
      const calendarDays: CalendarDayDto[] = [];

      for (let index = 0; index < days; index += 1) {
        const current = new Date(startDate);
        current.setDate(startDate.getDate() + index);
        current.setHours(0, 0, 0, 0);
        const dayOfWeek = jsDayToPrismaDay[current.getDay()];
        const rules = space.availabilityRules.filter((rule) => rule.dayOfWeek === dayOfWeek);
        const daySlots: AvailabilitySlotDto[] = [];

        for (const rule of rules) {
          let cursor = combineDateAndTime(current, rule.startTime);
          const ruleEnd = combineDateAndTime(current, rule.endTime);

          while (addHours(cursor, 1) <= ruleEnd) {
            const slotStart = new Date(cursor);
            const slotEnd = addHours(slotStart, 1);
            const booking = space.bookings.find((item) => overlaps(slotStart, slotEnd, item.startAt, item.endAt));
            const block = space.availabilityBlocks.find((item) => overlaps(slotStart, slotEnd, item.startAt, item.endAt));
            const isPast = slotStart < new Date();

            daySlots.push({
              startAt: slotStart.toISOString(),
              endAt: slotEnd.toISOString(),
              label: `${pad(slotStart.getHours())}:00`,
              status: isPast ? 'PAST' : booking ? 'BOOKED' : block ? 'BLOCKED' : 'AVAILABLE',
              bookingId: booking?.id,
              bookingStatus: booking?.status,
              blockReason: block?.reason,
            });

            cursor = slotEnd;
          }
        }

        calendarDays.push({
          date: toDateOnly(current),
          dayOfWeek,
          isClosed: rules.length === 0,
          slots: daySlots,
        });
      }

      return {
        spaceId: space.id,
        spaceName: space.name,
        days: calendarDays,
      };
    });
  }
}
