import { validate } from 'class-validator';
import { CreateConversationMessageDto } from '../../src/conversations/dto/create-conversation-message.dto';

describe('CreateConversationMessageDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = 'Hello, this is a test message';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail without recipientId', async () => {
    const dto = new CreateConversationMessageDto();
    dto.content = 'Hello';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipientId');
  });

  it('should fail without content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('should fail with empty string recipientId', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = '';
    dto.content = 'Hello';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with empty string content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with non-string recipientId', async () => {
    const dto = new CreateConversationMessageDto();
    (dto as any).recipientId = 123;
    dto.content = 'Hello';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with non-string content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    (dto as any).content = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with content exceeding 10000 characters', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = 'a'.repeat(10001);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('should pass with content at 10000 characters limit', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = 'a'.repeat(10000);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept content with special characters', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = 'Hello! 👋 Test <>&"\'';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept multiline content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = 'Line 1\nLine 2\nLine 3';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept unicode characters in content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = 'José García 日本語 emoji 🎉';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept various recipientId formats', async () => {
    const validRecipientIds = [
      'user123',
      'org-456',
      'member_789',
      'uuid-1234-5678-90ab-cdef',
      '507f1f77bcf86cd799439011',
    ];

    for (const recipientId of validRecipientIds) {
      const dto = new CreateConversationMessageDto();
      dto.recipientId = recipientId;
      dto.content = 'Test message';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('should validate DTO with both fields at their limits', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'a'.repeat(200);
    dto.content = 'b'.repeat(10000);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should handle HTML/script tags in content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = '<script>alert("xss")</script><div>Hello</div>';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should handle URLs in content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    dto.content = 'Check this out: https://example.com?param=value&other=123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with null recipientId', async () => {
    const dto = new CreateConversationMessageDto();
    (dto as any).recipientId = null;
    dto.content = 'Hello';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with null content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';
    (dto as any).content = null;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with undefined recipientId', async () => {
    const dto = new CreateConversationMessageDto();
    dto.content = 'Hello';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with undefined content', async () => {
    const dto = new CreateConversationMessageDto();
    dto.recipientId = 'user123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
