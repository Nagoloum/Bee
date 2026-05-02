import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TwoFactorService {
  private readonly key: Buffer;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const raw = config.getOrThrow<string>('ENCRYPTION_KEY');
    this.key = createHash('sha256').update(raw).digest(); // 32 bytes
    authenticator.options = { window: 1, step: 30 };
  }

  private encrypt(plain: string): Buffer {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]);
  }

  private decrypt(data: Buffer): string {
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const enc = data.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  }

  /**
   * Génère un secret TOTP pour l'utilisateur (non encore activé).
   * Retourne l'URI otpauth:// à encoder en QR code.
   */
  async setup(userId: string, email: string): Promise<{ secret: string; otpauthUrl: string }> {
    const secret = authenticator.generateSecret();
    const encrypted = this.encrypt(secret);

    await this.prisma.twoFactorSecret.upsert({
      where: { userId },
      update: { secretEncrypted: encrypted, enabledAt: null },
      create: { userId, secretEncrypted: encrypted },
    });

    const otpauthUrl = authenticator.keyuri(email, 'Bee Marketplace', secret);
    return { secret, otpauthUrl };
  }

  /**
   * Active la 2FA après vérification du premier code valide.
   */
  async enable(userId: string, code: string): Promise<{ recoveryCodes: string[] }> {
    const row = await this.prisma.twoFactorSecret.findUnique({ where: { userId } });
    if (!row) throw new NotFoundException('Setup 2FA first');
    const secret = this.decrypt(row.secretEncrypted);
    if (!authenticator.verify({ token: code, secret })) {
      throw new BadRequestException('Invalid code');
    }

    const recoveryCodes = Array.from({ length: 10 }, () =>
      randomBytes(5).toString('hex').toUpperCase(),
    );
    const hashes = recoveryCodes.map((c) => createHash('sha256').update(c).digest('hex'));

    await this.prisma.twoFactorSecret.update({
      where: { userId },
      data: { enabledAt: new Date(), recoveryCodesHash: hashes },
    });

    return { recoveryCodes };
  }

  /**
   * Vérifie un code TOTP ou recovery.
   */
  async verify(userId: string, code: string): Promise<boolean> {
    const row = await this.prisma.twoFactorSecret.findUnique({ where: { userId } });
    if (!row?.enabledAt) return false;

    const secret = this.decrypt(row.secretEncrypted);
    if (authenticator.verify({ token: code, secret })) {
      await this.prisma.twoFactorSecret.update({
        where: { userId },
        data: { lastUsedAt: new Date() },
      });
      return true;
    }

    // Fallback : recovery code
    const hash = createHash('sha256').update(code.toUpperCase()).digest('hex');
    if (row.recoveryCodesHash.includes(hash)) {
      await this.prisma.twoFactorSecret.update({
        where: { userId },
        data: {
          recoveryCodesHash: row.recoveryCodesHash.filter((h) => h !== hash),
          lastUsedAt: new Date(),
        },
      });
      return true;
    }
    return false;
  }

  async isEnabled(userId: string): Promise<boolean> {
    const row = await this.prisma.twoFactorSecret.findUnique({ where: { userId } });
    return !!row?.enabledAt;
  }
}
