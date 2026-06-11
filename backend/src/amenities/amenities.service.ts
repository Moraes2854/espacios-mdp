import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

type AmenityFilters = {
  includeInactive?: boolean;
  search?: string;
};

type NormalizedAmenityData = {
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  category?: string | null;
  sortOrder: number;
  isActive: boolean;
};

@Injectable()
export class AmenitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: AmenityFilters = {}) {
    const search = filters.search?.trim();
    const where: Prisma.AmenityWhereInput = {
      ...(filters.includeInactive ? {} : { isActive: true }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.amenity.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string) {
    const amenity = await this.prisma.amenity.findUnique({ where: { id } });

    if (!amenity) {
      throw new NotFoundException('No se encontró el servicio.');
    }

    return amenity;
  }

  async create(data: CreateAmenityDto) {
    const amenity = this.normalizeCreateData(data);
    await this.validateAvailableSlug({ slug: amenity.slug });

    return this.prisma.amenity.create({ data: amenity });
  }

  async update(id: string, data: UpdateAmenityDto) {
    const currentAmenity = await this.findById(id);
    const amenity = this.normalizeUpdateData(data, {
      name: currentAmenity.name,
      slug: currentAmenity.slug,
      icon: currentAmenity.icon,
      description: currentAmenity.description,
      category: currentAmenity.category,
      sortOrder: currentAmenity.sortOrder,
      isActive: currentAmenity.isActive,
    });

    await this.validateAvailableSlug({ slug: amenity.slug, ignoreId: id });

    return this.prisma.amenity.update({
      where: { id },
      data: amenity,
    });
  }

  async setActive(id: string, isActive: boolean) {
    await this.findById(id);

    return this.prisma.amenity.update({
      where: { id },
      data: { isActive },
    });
  }

  private normalizeCreateData(data: CreateAmenityDto): NormalizedAmenityData {
    const name = data.name?.trim();

    if (!name) {
      throw new BadRequestException('El nombre del servicio es obligatorio.');
    }

    return {
      name,
      slug: this.normalizeSlug(data.slug || name),
      icon: data.icon?.trim() || null,
      description: data.description?.trim() || null,
      category: data.category?.trim() || null,
      sortOrder: Number(data.sortOrder ?? 0),
      isActive: data.isActive ?? true,
    };
  }

  private normalizeUpdateData(data: UpdateAmenityDto, fallback: NormalizedAmenityData): NormalizedAmenityData {
    const name = data.name?.trim() || fallback.name;

    if (!name) {
      throw new BadRequestException('El nombre del servicio es obligatorio.');
    }

    return {
      name,
      slug: this.normalizeSlug(data.slug || fallback.slug || name),
      icon: data.icon !== undefined ? data.icon?.trim() || null : fallback.icon || null,
      description: data.description !== undefined ? data.description?.trim() || null : fallback.description || null,
      category: data.category !== undefined ? data.category?.trim() || null : fallback.category || null,
      sortOrder: Number(data.sortOrder ?? fallback.sortOrder ?? 0),
      isActive: data.isActive ?? fallback.isActive,
    };
  }

  private async validateAvailableSlug({ slug, ignoreId }: { slug: string; ignoreId?: string }) {
    const existingAmenity = await this.prisma.amenity.findFirst({
      where: {
        slug,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existingAmenity) {
      throw new BadRequestException('Ya existe un servicio con ese nombre.');
    }
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
