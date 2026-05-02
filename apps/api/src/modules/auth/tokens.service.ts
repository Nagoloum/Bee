import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { UserRole } from '@prisma/client';
import type { JwtPayload } from './strategies/jwt.strategy';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private sha256(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  async issuePair(
    userId: string,
    email: string,
    role: UserRole,
    tfa = false,
    deviceInfo?: { deviceId?: string; platform?: string; ip?: string; userAgent?: string },
  ): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email, role, tfa };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
    });

    const refreshToken = this.jwt.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_TTL', '30d'),
      },
    );

    await this.prisma.userSession.create({
      data: {
        userId,
        refreshTokenHash: this.sha256(refreshToken),
        deviceId: deviceInfo?.deviceId,
        platform: deviceInfo?.platform,
        ip: deviceInfo?.ip,
        userAgent: deviceInfo?.userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async issueTempTfaToken(userId: string, email: string, role: UserRole): Promise<string> {
    return this.jwt.sign(
      { sub: userId, email, role, tfa: false, tempTfa: true },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: '5m',
      },
    );
  }

  verifyRefresh(token: string): { sub: string } {
    return this.jwt.verify(token, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }

  async rotateRefresh(oldToken: string): Promise<TokenPair> {
    const payload = this.verifyRefresh(oldToken);
    const hash = this.sha256(oldToken);
    const session = await this.prisma.userSession.findFirst({
      where: { userId: payload.sub, refreshTokenHash: hash, revokedAt: null },
    });
    if (!session) throw new Error('Invalid refresh token');

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
      select: { email: true, role: true },
    });

    return this.issuePair(payload.sub, user.email, user.role, true);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
