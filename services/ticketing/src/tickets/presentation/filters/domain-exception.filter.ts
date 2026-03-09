import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainException } from 'src/tickets/domain/exceptions/domain.exception';
import { DomainNotFoundException } from 'src/tickets/domain/exceptions/domain-not-found.exception';
import { DomainValidationException } from 'src/tickets/domain/exceptions/domain-validation.exception';
import { DomainConflictException } from 'src/tickets/domain/exceptions/domain-conflict.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.resolveStatus(error);
    const exception = new HttpException(error.message, status);
    response.status(status).json(exception.getResponse());
  }

  private resolveStatus(error: DomainException): HttpStatus {
    if (error instanceof DomainNotFoundException) return HttpStatus.NOT_FOUND;
    if (error instanceof DomainValidationException)
      return HttpStatus.BAD_REQUEST;
    if (error instanceof DomainConflictException) return HttpStatus.CONFLICT;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
