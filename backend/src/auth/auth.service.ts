import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async devLogin(role: UserRole) {
    const email = role === UserRole.ADMIN ? 'admin@espaciosmdp.com' : 'cliente.demo@espaciosmdp.com';
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { professionalProfile: true },
    });

    return {
      message: 'Dev login. Reemplazar por JWT/OAuth real en producción.',
      token: `dev-token-${role.toLowerCase()}`,
      user,
    };
  }

  googlePlaceholder() {
    return {
      message: 'Google OAuth todavía no está implementado.',
      nextStep: 'Configurar Google OAuth client, callback, estado CSRF y persistencia de sesión/JWT.',
    };
  }
}
