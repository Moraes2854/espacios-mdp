import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurringBookingRulesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.recurringBookingRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: { space: true, professionalProfile: { include: { user: true } } },
    });
  }

  create(data: any) {
    return this.prisma.recurringBookingRule.create({
      data: {
        ...data,
        startsOn: new Date(data.startsOn),
        endsOn: data.endsOn ? new Date(data.endsOn) : undefined,
      },
    });
  }
}
