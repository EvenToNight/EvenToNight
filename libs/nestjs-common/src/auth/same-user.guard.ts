import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  mixin,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from './jwt.strategy';

export const SameUserGuard = (
  getUserId: (req: Request) => string | undefined = (req) => {
    const userId = req.params['userId'];
    return typeof userId === 'string' ? userId : undefined;
  },
) => {
  @Injectable()
  class SameUserGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<Request>();
      const userId = getUserId(request);
      const currentUserId = (request.user as AuthUser)?.userId;

      if (userId !== currentUserId) {
        throw new ForbiddenException(
          'Forbidden: Cannot access resources of other users',
        );
      }

      return true;
    }
  }

  return mixin(SameUserGuardMixin);
};
