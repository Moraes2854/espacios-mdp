import { Injectable } from '@nestjs/common';
import { LeadSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { desiredSpace: true },
    });
  }

  create(data: any) {
    return this.prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source || LeadSource.WEB,
        desiredSpaceId: data.desiredSpaceId,
        desiredDate: data.desiredDate ? new Date(data.desiredDate) : undefined,
        desiredTime: data.desiredTime,
      },
    });
  }
}
