import { validate } from 'class-validator';
import { SendMessageDto } from '../../src/conversations/dto/send-message.dto';

describe('SendMessageDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new SendMessageDto();
    dto.senderId = 'user123';
    dto.content = 'Hello, this is a test message';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail without senderId', async () => {
    const dto = new SendMessageDto();
    dto.content = 'Hello';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('senderId');
  });

  it('should fail without content', async () => {
    const dto = new SendMessageDto();
    dto.senderId = 'user123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('should fail with empty string senderId', async () => {
    const dto = new SendMessageDto();
    dto.senderId = '';
    dto.content = 'Hello';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with empty string content', async () => {
    const dto = new SendMessageDto();
    dto.senderId = 'user123';
    dto.content = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with content exceeding 10000 characters', async () => {
    const dto = new SendMessageDto();
    dto.senderId = 'user123';
    dto.content = 'a'.repeat(10001);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('should pass with content at 10000 characters limit', async () => {
    const dto = new SendMessageDto();
    dto.senderId = 'user123';
    dto.content = 'a'.repeat(10000);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept content with special characters', async () => {
    const dto = new SendMessageDto();
    dto.senderId = 'user123';
    dto.content = 'Hello! 👋 Test <>&"\'';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept multiline content', async () => {
    const dto = new SendMessageDto();
    dto.senderId = 'user123';
    dto.content = 'Line 1\nLine 2\nLine 3';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
