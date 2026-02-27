import { UserNotFoundException } from 'src/tickets/domain/exceptions/user-not-found.exception';

describe('UserNotFoundException', () => {
  it('includes the user ID in the message when provided', () => {
    const err = new UserNotFoundException('user-42');
    expect(err.message).toBe('User with id user-42 not found');
    expect(err.name).toBe('UserNotFoundException');
    expect(err).toBeInstanceOf(Error);
  });

  it('uses a generic message when no ID is provided', () => {
    const err = new UserNotFoundException();
    expect(err.message).toBe('User not found');
  });
});
