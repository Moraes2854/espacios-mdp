import { Injectable } from '@nestjs/common';
import { PricingModuleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingModulesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pricingModule.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { durationHours: 'asc' }],
    });
  }

  create(data: any) {
    const durationHours = data.durationHours ? Number(data.durationHours) : null;
    const weeklyHours = data.weeklyHours ? Number(data.weeklyHours) : null;
    const pricePerHour = Number(data.pricePerHour || 0);
    const totalPrice = Number(data.totalPrice || (durationHours ? durationHours * pricePerHour : weeklyHours ? weeklyHours * pricePerHour : 0));

    return this.prisma.pricingModule.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        moduleType: data.moduleType || PricingModuleType.CONTINUOUS_BLOCK,
        durationHours,
        weeklyHours,
        pricePerHour,
        totalPrice,
        sortOrder: data.sortOrder ? Number(data.sortOrder) : 0,
        isActive: data.isActive ?? true,
      },
    });
  }
}
