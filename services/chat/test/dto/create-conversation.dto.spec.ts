import { validate } from 'class-validator';
import { CreateConversationDto } from '../../src/conversations/dto/create-conversation.dto';

describe('CreateConversationDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateConversationDto();
    dto.organizationId = 'org123';
    dto.memberId = 'member456';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail without organizationId', async () => {
    const dto = new CreateConversationDto();
    dto.memberId = 'member456';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('organizationId');
  });

  it('should fail without memberId', async () => {
    const dto = new CreateConversationDto();
    dto.organizationId = 'org123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('memberId');
  });

  it('should fail with empty string organizationId', async () => {
    const dto = new CreateConversationDto();
    dto.organizationId = '';
    dto.memberId = 'member456';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with empty string memberId', async () => {
    const dto = new CreateConversationDto();
    dto.organizationId = 'org123';
    dto.memberId = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with non-string organizationId', async () => {
    const dto = new CreateConversationDto();
    (dto as any).organizationId = 123;
    dto.memberId = 'member456';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with non-string memberId', async () => {
    const dto = new CreateConversationDto();
    dto.organizationId = 'org123';
    (dto as any).memberId = 456;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
