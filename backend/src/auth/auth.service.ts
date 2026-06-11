import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

type AuthenticatedUser = Omit<User, 'passwordHash'> & {
  professionalProfile: {
    id: string;
    userId: string;
    displayName: string | null;
    profession: string | null;
    documentType: string | null;
    documentNumber: string | null;
    taxCondition: string | null;
    billingEmail: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const TOKEN_TYPE = 'Bearer';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function cleanOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function displayName(firstName: string, lastName?: string) {
  return [firstName, cleanOptionalText(lastName)].filter(Boolean).join(' ');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    const email = normalizeEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta registrada con ese email.');
    }

    const firstName = dto.firstName.trim();
    const lastName = cleanOptionalText(dto.lastName);
    const phone = cleanOptionalText(dto.phone);
    const profession = cleanOptionalText(dto.profession);
    const documentNumber = dto.documentNumber.trim();
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: UserRole.PROFESSIONAL,
        status: UserStatus.ACTIVE,
        professionalProfile: {
          create: {
            displayName: displayName(firstName, lastName),
            profession,
            documentType: 'DNI',
            documentNumber,
            billingEmail: email,
          },
        },
      },
      include: { professionalProfile: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SIGN_UP',
        entityType: 'User',
        entityId: user.id,
        after: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          professionalProfileId: user.professionalProfile?.id,
        },
      },
    });

    return this.buildAuthSession(user);
  }

  async login(dto: LoginDto) {
    const email = normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { professionalProfile: true },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('La cuenta no está activa.');
    }

    return this.buildAuthSession(user);
  }

  async me(authorization?: string) {
    const payload = this.verifyAuthorizationHeader(authorization);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { professionalProfile: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Sesión inválida o expirada.');
    }

    return this.sanitizeUser(user);
  }

  verifyAuthorizationHeader(authorization?: string) {
    if (!authorization) {
      throw new UnauthorizedException('Falta token de autorización.');
    }

    const [type, token] = authorization.split(' ');
    if (type !== TOKEN_TYPE || !token) {
      throw new UnauthorizedException('Formato de token inválido.');
    }

    return this.verifyToken(token);
  }

  private buildAuthSession(user: User & { professionalProfile: AuthenticatedUser['professionalProfile'] }) {
    const sanitizedUser = this.sanitizeUser(user);
    const token = this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    });

    return {
      token,
      tokenType: TOKEN_TYPE,
      expiresIn: TOKEN_TTL_SECONDS,
      user: sanitizedUser,
    };
  }

  private sanitizeUser(user: User & { professionalProfile?: AuthenticatedUser['professionalProfile'] }): AuthenticatedUser {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return {
      ...safeUser,
      professionalProfile: user.professionalProfile || null,
    };
  }

  private signToken(payload: JwtPayload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Token inválido.');
    }

    const [encodedHeader, encodedPayload, receivedSignature] = parts;
    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);

    const receivedBuffer = Buffer.from(receivedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Token inválido.');
    }

    try {
      const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
      if (!payload.sub || !payload.email || !payload.role || !payload.exp) {
        throw new BadRequestException();
      }

      if (payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('La sesión expiró.');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Token inválido.');
    }
  }

  private sign(value: string) {
    return createHmac('sha256', this.jwtSecret()).update(value).digest('base64url');
  }

  private jwtSecret() {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret || secret.length < 16) {
      throw new BadRequestException('JWT_SECRET no está configurado o es demasiado corto.');
    }
    return secret;
  }
}
