import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetMessagesQueryDto } from '../../src/conversations/dto/get-messages-query.dto';

describe('GetMessagesQueryDto', () => {
  it('should validate with default values', async () => {
    const dto = new GetMessagesQueryDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.limit).toBe(50);
    expect(dto.offset).toBe(0);
  });

  it('should validate with custom valid values', async () => {
    const plain = { limit: '75', offset: '25' };
    const dto = plainToClass(GetMessagesQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.limit).toBe(75);
    expect(dto.offset).toBe(25);
  });

  it('should fail with limit below 1', async () => {
    const plain = { limit: '0' };
    const dto = plainToClass(GetMessagesQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should fail with limit above 100', async () => {
    const plain = { limit: '101' };
    const dto = plainToClass(GetMessagesQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should fail with negative offset', async () => {
    const plain = { offset: '-1' };
    const dto = plainToClass(GetMessagesQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('offset');
  });

  it('should transform string numbers to integers', () => {
    const plain = { limit: '50', offset: '200' };
    const dto = plainToClass(GetMessagesQueryDto, plain);

    expect(typeof dto.limit).toBe('number');
    expect(typeof dto.offset).toBe('number');
    expect(dto.limit).toBe(50);
    expect(dto.offset).toBe(200);
  });
});
