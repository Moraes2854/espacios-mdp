import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.space.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: {
        amenities: { orderBy: { position: 'asc' } },
        images: { orderBy: { position: 'asc' } },
        availabilityRules: true,
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.space.findUnique({
      where: { slug },
      include: {
        amenities: { orderBy: { position: 'asc' } },
        images: { orderBy: { position: 'asc' } },
        availabilityRules: true,
        availabilityBlocks: { orderBy: { startAt: 'asc' } },
      },
    });
  }

  create(data: Prisma.SpaceCreateInput) {
    return this.prisma.space.create({ data });
  }
}
