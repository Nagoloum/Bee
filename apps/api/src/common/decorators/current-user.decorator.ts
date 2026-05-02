import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserRole } from '@prisma/client';

export interface CurrentUserPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
  const req = ctx.switchToHttp().getRequest<Request & { user?: CurrentUserPayload }>();
  if (!req.user) throw new Error('No authenticated user on request');
  return req.user;
});
