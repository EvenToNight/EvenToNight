import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EmptyUserIdException } from 'src/tickets/domain/exceptions/empty-user-id.exception';

describe('UserId', () => {
  describe('fromString', () => {
    it('should create UserId from valid string', () => {
      const result = UserId.fromString('user-123');
      expect(result).toBeInstanceOf(UserId);
      expect(result.getValue()).toBe('user-123');
    });

    it('should throw error for empty string', () => {
      expect(() => UserId.fromString('')).toThrow(EmptyUserIdException);
    });

    it('should throw error for string with only spaces', () => {
      expect(() => UserId.fromString('   ')).toThrow(EmptyUserIdException);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const id1 = UserId.fromString('user-123');
      const id2 = UserId.fromString('user-123');
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different values', () => {
      const id1 = UserId.fromString('user-123');
      const id2 = UserId.fromString('user-456');
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const id = UserId.fromString('user-123');
      expect(id.toString()).toBe('user-123');
    });
  });

  describe('getValue', () => {
    it('should return the internal value', () => {
      const id = UserId.fromString('user-123');
      expect(id.getValue()).toBe('user-123');
    });
  });
});
