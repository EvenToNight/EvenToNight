import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetConversationsQueryDto } from '../../src/conversations/dto/get-conversations-query.dto';

describe('GetConversationsQueryDto', () => {
  it('should validate with default values', async () => {
    const dto = new GetConversationsQueryDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.limit).toBe(20);
    expect(dto.offset).toBe(0);
  });

  it('should validate with custom valid values', async () => {
    const plain = { limit: '50', offset: '10' };
    const dto = plainToClass(GetConversationsQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.limit).toBe(50);
    expect(dto.offset).toBe(10);
  });

  it('should fail with limit below 1', async () => {
    const plain = { limit: '0' };
    const dto = plainToClass(GetConversationsQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should fail with limit above 100', async () => {
    const plain = { limit: '101' };
    const dto = plainToClass(GetConversationsQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should fail with negative offset', async () => {
    const plain = { offset: '-1' };
    const dto = plainToClass(GetConversationsQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('offset');
  });

  it('should pass with offset 0', async () => {
    const plain = { offset: '0' };
    const dto = plainToClass(GetConversationsQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.offset).toBe(0);
  });

  it('should fail with non-integer limit', async () => {
    const plain = { limit: '10.5' };
    const dto = plainToClass(GetConversationsQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with non-integer offset', async () => {
    const plain = { offset: '5.5' };
    const dto = plainToClass(GetConversationsQueryDto, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should transform string numbers to integers', async () => {
    const plain = { limit: '25', offset: '100' };
    const dto = plainToClass(GetConversationsQueryDto, plain);

    expect(typeof dto.limit).toBe('number');
    expect(typeof dto.offset).toBe('number');
    expect(dto.limit).toBe(25);
    expect(dto.offset).toBe(100);
  });

  it('should accept limit at boundary values', async () => {
    const dto1 = plainToClass(GetConversationsQueryDto, { limit: '1' });
    const errors1 = await validate(dto1);
    expect(errors1.length).toBe(0);

    const dto2 = plainToClass(GetConversationsQueryDto, { limit: '100' });
    const errors2 = await validate(dto2);
    expect(errors2.length).toBe(0);
  });
});
