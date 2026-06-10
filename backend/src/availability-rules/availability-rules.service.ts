import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityRulesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.availabilityRule.findMany({
      orderBy: [{ spaceId: 'asc' }, { dayOfWeek: 'asc' }],
      include: { space: true },
    });
  }

  create(data: any) {
    return this.prisma.availabilityRule.create({ data });
  }
}
