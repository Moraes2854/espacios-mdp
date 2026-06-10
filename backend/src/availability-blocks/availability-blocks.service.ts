import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityBlocksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.availabilityBlock.findMany({
      orderBy: { startAt: 'asc' },
      include: { space: true },
    });
  }

  create(data: any) {
    return this.prisma.availabilityBlock.create({
      data: {
        ...data,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
      },
    });
  }
}
