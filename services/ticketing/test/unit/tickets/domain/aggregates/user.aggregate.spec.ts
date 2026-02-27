import { User } from 'src/tickets/domain/aggregates/user.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { Language } from 'src/tickets/domain/value-objects/language.vo';

describe('User Aggregate', () => {
  describe('create', () => {
    it('should create a user with id and language', () => {
      const user = User.create(
        UserId.fromString('user-123'),
        Language.fromString('en'),
      );

      expect(user.getId().toString()).toBe('user-123');
      expect(user.getLanguage().getCode()).toBe('en');
    });
  });

  describe('changeLanguage', () => {
    it('should change the language', () => {
      const user = User.create(
        UserId.fromString('user-123'),
        Language.fromString('en'),
      );

      user.changeLanguage(Language.fromString('it'));

      expect(user.getLanguage().getCode()).toBe('it');
    });
  });
});
