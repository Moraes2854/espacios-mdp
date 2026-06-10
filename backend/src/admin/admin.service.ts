import { Injectable } from '@nestjs/common';
import { BookingStatus, LeadStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [spaces, users, leads, bookings, payments, auditLogs, recurringRules, availabilityBlocks, availabilityRules, pricingModules] = await Promise.all([
      this.prisma.space.findMany({ include: { amenities: true, images: true, availabilityRules: true, availabilityBlocks: true, recurringRules: true } }),
      this.prisma.user.findMany({ include: { professionalProfile: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.lead.findMany({ include: { desiredSpace: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.booking.findMany({ include: { space: true, user: true, professionalProfile: true, payments: true, pricingModule: true }, orderBy: { startAt: 'asc' }, take: 30 }),
      this.prisma.payment.findMany({ include: { booking: { include: { space: true } }, user: true }, orderBy: { createdAt: 'desc' }, take: 30 }),
      this.prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 30 }),
      this.prisma.recurringBookingRule.findMany({ include: { space: true, professionalProfile: { include: { user: true } } }, orderBy: { createdAt: 'desc' }, take: 30 }),
      this.prisma.availabilityBlock.findMany({ include: { space: true }, orderBy: { startAt: 'asc' }, take: 30 }),
      this.prisma.availabilityRule.findMany({ include: { space: true }, orderBy: [{ spaceId: 'asc' }, { dayOfWeek: 'asc' }] }),
      this.prisma.pricingModule.findMany({ orderBy: [{ sortOrder: 'asc' }, { durationHours: 'asc' }] }),
    ]);

    const approvedPayments = payments.filter((payment) => payment.status === PaymentStatus.APPROVED);
    const revenue = approvedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const activeBookingStatuses: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.PAID];

    return {
      metrics: {
        activeSpaces: spaces.filter((space) => space.isActive).length,
        totalUsers: users.length,
        newLeads: leads.filter((lead) => lead.status === LeadStatus.NEW).length,
        activeBookings: bookings.filter((booking) => activeBookingStatuses.includes(booking.status)).length,
        approvedRevenue: revenue,
      },
      spaces,
      users,
      leads,
      bookings,
      payments,
      auditLogs,
      recurringRules,
      availabilityBlocks,
      availabilityRules,
      pricingModules,
    };
  }
}
