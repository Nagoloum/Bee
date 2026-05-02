import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Garde qui exige un JWT portant le claim `tfa: true` pour les admins.
 * Le login admin se fait en 2 étapes :
 *   1. POST /auth/login → renvoie un token temporaire avec tfa: false
 *   2. POST /auth/2fa/verify → renvoie le vrai access token avec tfa: true
 */
@Injectable()
export class TwoFactorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{
      user?: { role: string; tfa?: boolean };
    }>();
    if (!user) throw new ForbiddenException();
    if (user.role === 'ADMIN' && user.tfa !== true) {
      throw new ForbiddenException('2FA required for admin');
    }
    return true;
  }
}
