import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { professionalProfile: true },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { professionalProfile: true, bookings: true },
    });
  }

  async create(data: { email: string; firstName?: string; lastName?: string; phone?: string; role?: UserRole; password?: string }) {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    return this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || UserRole.PROFESSIONAL,
        passwordHash,
      },
    });
  }
}
