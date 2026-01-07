import { validate } from 'class-validator';
import { MarkAsReadDto } from '../../src/conversations/dto/mark-as-read.dto';

describe('MarkAsReadDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new MarkAsReadDto();
    dto.userId = 'user123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail without userId', async () => {
    const dto = new MarkAsReadDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userId');
  });

  it('should fail with empty string userId', async () => {
    const dto = new MarkAsReadDto();
    dto.userId = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with non-string userId', async () => {
    const dto = new MarkAsReadDto();
    (dto as any).userId = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
