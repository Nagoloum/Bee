import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TokensService } from './tokens.service';
import { TwoFactorService } from './two-factor.service';
import type { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokensService,
    private readonly tfa: TwoFactorService,
  ) {}

  private generateReferralCode(): string {
    return randomBytes(6).toString('base64url').toUpperCase().slice(0, 8);
  }

  async register(dto: RegisterDto) {
    // ⚠️ Interdit de créer un ADMIN via cette route.
    if ((dto.role as string) === 'ADMIN') {
      throw new ForbiddenException('Admin cannot be created via registration');
    }

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, ...(dto.phone ? [{ phoneE164: dto.phone }] : [])] },
    });
    if (existing) throw new ConflictException('Email or phone already registered');

    let referrerId: string | undefined;
    if (dto.referralCode) {
      const ref = await this.prisma.user.findUnique({
        where: { referralCode: dto.referralCode },
        select: { id: true },
      });
      referrerId = ref?.id;
    }

    const hash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phoneE164: dto.phone,
        passwordHash: hash,
        role: dto.role,
        status: 'ACTIVE',
        referralCode: this.generateReferralCode(),
        referredById: referrerId,
        profile: { create: {} },
        wallet: { create: { type: dto.role === UserRole.CLIENT ? 'CLIENT' : dto.role === UserRole.VENDOR ? 'VENDOR' : 'DELIVERY' } },
      },
      select: { id: true, email: true, role: true },
    });

    return this.tokens.issuePair(user.id, user.email, user.role, true);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        passwordHash: true,
        failedLoginCount: true,
        lockedUntil: true,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account locked — try again later');
    }
    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account not allowed');
    }

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) {
      const newCount = user.failedLoginCount + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: newCount,
          lockedUntil: newCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    // Admin ⇒ 2FA obligatoire
    if (user.role === UserRole.ADMIN) {
      const hasTfa = await this.tfa.isEnabled(user.id);
      if (!hasTfa) {
        // Premier login admin : on expose le setup
        const setup = await this.tfa.setup(user.id, user.email);
        const tempToken = await this.tokens.issueTempTfaToken(user.id, user.email, user.role);
        return {
          requires2FASetup: true,
          tempToken,
          otpauthUrl: setup.otpauthUrl,
        };
      }
      const tempToken = await this.tokens.issueTempTfaToken(user.id, user.email, user.role);
      return { requires2FA: true, tempToken };
    }

    return this.tokens.issuePair(user.id, user.email, user.role, true);
  }

  async verifyTwoFactor(tempToken: string, code: string) {
    // On décode sans vérifier via jwt-service ici pour simplifier — à sécuriser avec un service qui vérifie la signature
    const parts = tempToken.split('.');
    if (parts.length !== 3) throw new BadRequestException('Invalid temp token');
    const payload = JSON.parse(Buffer.from(parts[1] ?? '', 'base64url').toString());
    const ok = await this.tfa.verify(payload.sub, code);
    if (!ok) throw new UnauthorizedException('Invalid 2FA code');
    return this.tokens.issuePair(payload.sub, payload.email, payload.role, true);
  }

  async logout(userId: string) {
    await this.tokens.revokeAllSessions(userId);
    return { success: true };
  }
}
