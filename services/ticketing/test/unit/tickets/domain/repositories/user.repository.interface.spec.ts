import { USER_REPOSITORY } from 'src/tickets/domain/repositories/user.repository.interface';

describe('UserRepository', () => {
  it('should export USER_REPOSITORY token', () => {
    expect(typeof USER_REPOSITORY).toBe('symbol');
    expect(USER_REPOSITORY.toString()).toBe('Symbol(USER_REPOSITORY)');
  });
});
