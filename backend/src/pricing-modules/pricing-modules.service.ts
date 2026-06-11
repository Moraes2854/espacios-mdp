import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PricingModuleType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePricingModuleDto } from './dto/create-pricing-module.dto';
import { UpdatePricingModuleDto } from './dto/update-pricing-module.dto';

type PricingModuleFilters = {
  spaceId?: string;
  includeInactive?: boolean;
};

type NormalizedPricingModuleData = {
  spaceId: string;
  name: string;
  slug: string;
  description?: string | null;
  moduleType: PricingModuleType;
  durationHours?: number | null;
  weeklyHours?: number | null;
  pricePerHour: number;
  totalPrice: number;
  sortOrder: number;
  isActive: boolean;
};

const pricingModuleInclude = {
  space: true,
} satisfies Prisma.PricingModuleInclude;

@Injectable()
export class PricingModulesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: PricingModuleFilters = {}) {
    const where: Prisma.PricingModuleWhereInput = {
      ...(filters.includeInactive ? {} : { isActive: true }),
      ...(filters.spaceId ? { spaceId: filters.spaceId } : {}),
    };

    return this.prisma.pricingModule.findMany({
      where,
      include: pricingModuleInclude,
      orderBy: [
        { space: { floor: 'asc' } },
        { sortOrder: 'asc' },
        { durationHours: 'asc' },
        { weeklyHours: 'asc' },
      ],
    });
  }

  async findById(id: string) {
    const pricingModule = await this.prisma.pricingModule.findUnique({
      where: { id },
      include: pricingModuleInclude,
    });

    if (!pricingModule) {
      throw new NotFoundException('No se encontró el módulo de precio.');
    }

    return pricingModule;
  }

  async create(data: CreatePricingModuleDto) {
    const pricingModule = await this.normalizeData(data);
    await this.validateSpace(pricingModule.spaceId);
    await this.validateAvailableSlug({ spaceId: pricingModule.spaceId, slug: pricingModule.slug });

    return this.prisma.pricingModule.create({
      data: pricingModule,
      include: pricingModuleInclude,
    });
  }

  async update(id: string, data: UpdatePricingModuleDto) {
    const currentPricingModule = await this.findById(id);
    const pricingModule = await this.normalizeData({
      spaceId: data.spaceId ?? currentPricingModule.spaceId ?? undefined,
      name: data.name ?? currentPricingModule.name,
      slug: data.slug ?? currentPricingModule.slug,
      description: data.description ?? currentPricingModule.description,
      moduleType: data.moduleType ?? currentPricingModule.moduleType,
      durationHours: data.durationHours ?? currentPricingModule.durationHours,
      weeklyHours: data.weeklyHours ?? currentPricingModule.weeklyHours,
      pricePerHour: data.pricePerHour ?? Number(currentPricingModule.pricePerHour),
      totalPrice: data.totalPrice ?? Number(currentPricingModule.totalPrice),
      sortOrder: data.sortOrder ?? currentPricingModule.sortOrder,
      isActive: data.isActive ?? currentPricingModule.isActive,
    });

    await this.validateSpace(pricingModule.spaceId);
    await this.validateAvailableSlug({ spaceId: pricingModule.spaceId, slug: pricingModule.slug, ignoreId: id });

    return this.prisma.pricingModule.update({
      where: { id },
      data: pricingModule,
      include: pricingModuleInclude,
    });
  }

  async setActive(id: string, isActive: boolean) {
    const currentPricingModule = await this.findById(id);

    if (isActive && currentPricingModule.spaceId) {
      await this.validateSpace(currentPricingModule.spaceId);
    }

    return this.prisma.pricingModule.update({
      where: { id },
      data: { isActive },
      include: pricingModuleInclude,
    });
  }

  async deactivate(id: string) {
    await this.findById(id);

    return this.setActive(id, false);
  }

  private async validateSpace(spaceId: string) {
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });

    if (!space) {
      throw new BadRequestException('El espacio seleccionado no existe.');
    }

    if (!space.isActive) {
      throw new BadRequestException('El espacio seleccionado está inactivo.');
    }
  }

  private async validateAvailableSlug({
    spaceId,
    slug,
    ignoreId,
  }: {
    spaceId: string;
    slug: string;
    ignoreId?: string;
  }) {
    const existingPricingModule = await this.prisma.pricingModule.findFirst({
      where: {
        spaceId,
        slug,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existingPricingModule) {
      throw new BadRequestException('Ya existe un módulo con ese nombre para el espacio seleccionado.');
    }
  }

  private async normalizeData(data: Partial<CreatePricingModuleDto>): Promise<NormalizedPricingModuleData> {
    const spaceId = data.spaceId?.trim();
    const name = data.name?.trim();
    const moduleType = data.moduleType ?? PricingModuleType.CONTINUOUS_BLOCK;
    const pricePerHour = Number(data.pricePerHour ?? 0);
    const durationHours = this.normalizeInteger(data.durationHours);
    const weeklyHours = this.normalizeInteger(data.weeklyHours);

    if (!spaceId) {
      throw new BadRequestException('El módulo de precio debe estar vinculado a un espacio.');
    }

    if (!name) {
      throw new BadRequestException('El nombre del módulo es obligatorio.');
    }

    if (!Object.values(PricingModuleType).includes(moduleType)) {
      throw new BadRequestException('El tipo de módulo no es válido.');
    }

    if (pricePerHour <= 0) {
      throw new BadRequestException('El precio por hora debe ser mayor a cero.');
    }

    if (moduleType === PricingModuleType.WEEKLY_PACK && !weeklyHours) {
      throw new BadRequestException('Los packs semanales deben indicar la cantidad de horas semanales.');
    }

    if (moduleType !== PricingModuleType.WEEKLY_PACK && !durationHours) {
      throw new BadRequestException('Los módulos por hora deben indicar duración.');
    }

    const totalPrice = this.calculateTotal({
      moduleType,
      durationHours,
      weeklyHours,
      pricePerHour,
      totalPrice: data.totalPrice,
    });

    return {
      spaceId,
      name,
      slug: this.normalizeSlug(data.slug || name),
      description: data.description?.trim() || null,
      moduleType,
      durationHours: moduleType === PricingModuleType.WEEKLY_PACK ? durationHours || 4 : durationHours,
      weeklyHours: moduleType === PricingModuleType.WEEKLY_PACK ? weeklyHours : null,
      pricePerHour,
      totalPrice,
      sortOrder: Number(data.sortOrder ?? 0),
      isActive: data.isActive ?? true,
    };
  }

  private calculateTotal({
    moduleType,
    durationHours,
    weeklyHours,
    pricePerHour,
    totalPrice,
  }: {
    moduleType: PricingModuleType;
    durationHours?: number | null;
    weeklyHours?: number | null;
    pricePerHour: number;
    totalPrice?: number;
  }) {
    const reportedTotal = Number(totalPrice ?? 0);
    if (reportedTotal > 0) return reportedTotal;

    const hours = moduleType === PricingModuleType.WEEKLY_PACK ? weeklyHours : durationHours;
    return Number(hours || 0) * pricePerHour;
  }

  private normalizeInteger(value?: number | null) {
    if (value === null || value === undefined || value === 0) return null;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? Math.trunc(numberValue) : null;
  }

  private normalizeSlug(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
