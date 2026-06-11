import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

type SpaceFilters = {
  includeInactive?: boolean;
};

type NormalizedSpaceData = {
  name: string;
  slug: string;
  description?: string | null;
  capacity?: number | null;
  floor?: string | null;
  address?: string | null;
  baseHourlyPrice: number;
  recurrentHourlyPrice?: number | null;
  isActive: boolean;
  amenityIds?: string[];
};

const spaceInclude = {
  amenities: {
    include: { amenity: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  },
  images: { orderBy: { position: 'asc' } },
  availabilityRules: true,
} satisfies Prisma.SpaceInclude;

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: SpaceFilters = {}) {
    return this.prisma.space.findMany({
      where: filters.includeInactive ? {} : { isActive: true },
      orderBy: [{ floor: 'asc' }, { createdAt: 'asc' }],
      include: spaceInclude,
    });
  }

  async findByIdOrSlug(identifier: string) {
    const space = await this.prisma.space.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        ...spaceInclude,
        availabilityBlocks: { orderBy: { startAt: 'asc' } },
      },
    });

    if (!space) {
      throw new NotFoundException('No se encontró el espacio.');
    }

    return space;
  }

  async create(data: CreateSpaceDto) {
    const space = this.normalizeCreateData(data);
    await this.validateAvailableSlug({ slug: space.slug });
    await this.validateAmenities(space.amenityIds || []);

    return this.prisma.space.create({
      data: this.buildSpaceCreateInput(space),
      include: spaceInclude,
    });
  }

  async update(id: string, data: UpdateSpaceDto) {
    const currentSpace = await this.findByIdOrSlug(id);
    const space = this.normalizeUpdateData(data, {
      name: currentSpace.name,
      slug: currentSpace.slug,
      description: currentSpace.description,
      capacity: currentSpace.capacity,
      floor: currentSpace.floor,
      address: currentSpace.address,
      baseHourlyPrice: Number(currentSpace.baseHourlyPrice),
      recurrentHourlyPrice: currentSpace.recurrentHourlyPrice === null ? null : Number(currentSpace.recurrentHourlyPrice),
      isActive: currentSpace.isActive,
      amenityIds: currentSpace.amenities.map((item) => item.amenityId).filter(Boolean) as string[],
    });

    await this.validateAvailableSlug({ slug: space.slug, ignoreId: currentSpace.id });
    await this.validateAmenities(space.amenityIds || []);

    return this.prisma.space.update({
      where: { id: currentSpace.id },
      data: this.buildSpaceUpdateInput(space),
      include: spaceInclude,
    });
  }

  async setActive(id: string, isActive: boolean) {
    const space = await this.findByIdOrSlug(id);

    return this.prisma.space.update({
      where: { id: space.id },
      data: { isActive },
      include: spaceInclude,
    });
  }

  async deactivate(id: string) {
    return this.setActive(id, false);
  }

  private buildSpaceCreateInput(space: NormalizedSpaceData): Prisma.SpaceCreateInput {
    const amenityIds = this.uniqueIds(space.amenityIds || []);

    return {
      name: space.name,
      slug: space.slug,
      description: space.description,
      capacity: space.capacity,
      floor: space.floor,
      address: space.address,
      baseHourlyPrice: space.baseHourlyPrice,
      recurrentHourlyPrice: space.recurrentHourlyPrice,
      isActive: space.isActive,
      amenities: amenityIds.length
        ? {
            create: amenityIds.map((amenityId, position) => ({
              amenity: { connect: { id: amenityId } },
              position,
            })),
          }
        : undefined,
    };
  }

  private buildSpaceUpdateInput(space: NormalizedSpaceData): Prisma.SpaceUpdateInput {
    const amenityIds = this.uniqueIds(space.amenityIds || []);

    return {
      name: space.name,
      slug: space.slug,
      description: space.description,
      capacity: space.capacity,
      floor: space.floor,
      address: space.address,
      baseHourlyPrice: space.baseHourlyPrice,
      recurrentHourlyPrice: space.recurrentHourlyPrice,
      isActive: space.isActive,
      amenities: {
        deleteMany: {},
        create: amenityIds.map((amenityId, position) => ({
          amenity: { connect: { id: amenityId } },
          position,
        })),
      },
    };
  }

  private normalizeCreateData(data: CreateSpaceDto): NormalizedSpaceData {
    const name = data.name?.trim();
    const baseHourlyPrice = Number(data.baseHourlyPrice ?? 0);

    if (!name) {
      throw new BadRequestException('El nombre del espacio es obligatorio.');
    }

    if (baseHourlyPrice <= 0) {
      throw new BadRequestException('El precio base por hora debe ser mayor a cero.');
    }

    return {
      name,
      slug: this.normalizeSlug(data.slug || name),
      description: data.description?.trim() || null,
      capacity: this.normalizeInteger(data.capacity),
      floor: data.floor?.trim() || null,
      address: data.address?.trim() || null,
      baseHourlyPrice,
      recurrentHourlyPrice: this.normalizeNullableNumber(data.recurrentHourlyPrice),
      isActive: data.isActive ?? true,
      amenityIds: this.uniqueIds(data.amenityIds || []),
    };
  }

  private normalizeUpdateData(data: UpdateSpaceDto, fallback: NormalizedSpaceData): NormalizedSpaceData {
    const name = data.name?.trim() || fallback.name;
    const baseHourlyPrice = Number(data.baseHourlyPrice ?? fallback.baseHourlyPrice);

    if (!name) {
      throw new BadRequestException('El nombre del espacio es obligatorio.');
    }

    if (baseHourlyPrice <= 0) {
      throw new BadRequestException('El precio base por hora debe ser mayor a cero.');
    }

    return {
      name,
      slug: this.normalizeSlug(data.slug || fallback.slug || name),
      description: data.description !== undefined ? data.description?.trim() || null : fallback.description || null,
      capacity: data.capacity !== undefined ? this.normalizeInteger(data.capacity) : fallback.capacity ?? null,
      floor: data.floor !== undefined ? data.floor?.trim() || null : fallback.floor || null,
      address: data.address !== undefined ? data.address?.trim() || null : fallback.address || null,
      baseHourlyPrice,
      recurrentHourlyPrice:
        data.recurrentHourlyPrice !== undefined
          ? this.normalizeNullableNumber(data.recurrentHourlyPrice)
          : fallback.recurrentHourlyPrice ?? null,
      isActive: data.isActive ?? fallback.isActive,
      amenityIds: data.amenityIds !== undefined ? this.uniqueIds(data.amenityIds) : fallback.amenityIds || [],
    };
  }

  private async validateAvailableSlug({ slug, ignoreId }: { slug: string; ignoreId?: string }) {
    const existingSpace = await this.prisma.space.findFirst({
      where: {
        slug,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existingSpace) {
      throw new BadRequestException('Ya existe un espacio con ese slug.');
    }
  }

  private async validateAmenities(amenityIds: string[]) {
    const ids = this.uniqueIds(amenityIds);
    if (!ids.length) return;

    const amenities = await this.prisma.amenity.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true },
    });

    if (amenities.length !== ids.length) {
      throw new BadRequestException('Uno o más servicios seleccionados no existen o están inactivos.');
    }
  }

  private uniqueIds(ids: string[]) {
    return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
  }

  private normalizeNullableNumber(value?: number | null) {
    if (value === null || value === undefined || value === 0) return null;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
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
