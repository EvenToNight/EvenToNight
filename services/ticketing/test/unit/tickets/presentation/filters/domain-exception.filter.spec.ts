import { HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { DomainExceptionFilter } from 'src/tickets/presentation/filters/domain-exception.filter';
import { DomainNotFoundException } from 'src/tickets/domain/exceptions/domain-not-found.exception';
import { DomainValidationException } from 'src/tickets/domain/exceptions/domain-validation.exception';
import { DomainConflictException } from 'src/tickets/domain/exceptions/domain-conflict.exception';
import { DomainException } from 'src/tickets/domain/exceptions/domain.exception';

class UnknownDomainException extends DomainException {}

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ArgumentsHost;
  });

  it('returns 404 for DomainNotFoundException', () => {
    filter.catch(new DomainNotFoundException('not found'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('returns 400 for DomainValidationException', () => {
    filter.catch(new DomainValidationException('bad request'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('returns 409 for DomainConflictException', () => {
    filter.catch(new DomainConflictException('conflict'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('returns 500 for an unknown DomainException subclass', () => {
    filter.catch(new UnknownDomainException('generic error'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalled();
  });
});
