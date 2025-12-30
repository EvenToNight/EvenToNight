import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginatedQueryDto } from '../../../src/common/dto/paginated-query.dto';

describe('PaginationQueryDto', () => {
  it('valid when no pagination provided', async () => {
    const dto = plainToInstance(PaginatedQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('valid when offset and limit are valid numbers', async () => {
    const dto = plainToInstance(PaginatedQueryDto, {
      offset: '0',
      limit: '10',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('invalid when offset is negative', async () => {
    const dto = plainToInstance(PaginatedQueryDto, { offset: -1, limit: 10 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('invalid when limit is out of bounds', async () => {
    const dto = plainToInstance(PaginatedQueryDto, { offset: 0, limit: 200 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
