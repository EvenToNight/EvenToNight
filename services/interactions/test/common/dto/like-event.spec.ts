import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LikeEventDto } from '../../../src/events/dto/like-event.dto';

describe('LikeEventDto', () => {
  it('validates successfully with a valid userId', async () => {
    const dto = plainToInstance(LikeEventDto, { userId: 'user123' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails validation when userId is missing', async () => {
    const dto = plainToInstance(LikeEventDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const userIdError = errors.find((e) => e.property === 'userId');
    expect(userIdError).toBeDefined();
  });

  it('fails validation when userId is not a string', async () => {
    const dto = plainToInstance(LikeEventDto, { userId: 123 });
    const errors = await validate(dto as any);
    expect(errors.length).toBeGreaterThan(0);
    const userIdError = errors.find((e) => e.property === 'userId');
    expect(userIdError).toBeDefined();
  });
});
