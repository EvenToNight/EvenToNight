import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from './jwt.strategy';

@Injectable()
export class SameUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.params.userId;
    const currentUserId = (request.user as AuthUser)?.userId;

    if (userId !== currentUserId) {
      throw new ForbiddenException(
        'Forbidden: Cannot access resources of other users',
      );
    }

    return true;
  }
}
