import { UserAlreadyExistsException } from 'src/tickets/domain/exceptions/user-already-exists.exception';

describe('UserAlreadyExistsException', () => {
  it('includes the user ID in the message', () => {
    const err = new UserAlreadyExistsException('user-42');
    expect(err.message).toBe('User with id user-42 already exists');
    expect(err.name).toBe('UserAlreadyExistsException');
    expect(err).toBeInstanceOf(Error);
  });
});
