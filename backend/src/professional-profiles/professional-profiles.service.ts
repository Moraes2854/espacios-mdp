import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.professionalProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  create(data: any) {
    return this.prisma.professionalProfile.create({ data });
  }
}
