import { TicketType } from '../../../../../src/tickets/domain/value-objects/ticket-type.vo';

describe('TicketType', () => {
  describe('fromString', () => {
    it('should create STANDARD type from string', () => {
      const type = TicketType.fromString('STANDARD');

      expect(type).toBe(TicketType.STANDARD);
      expect(type.toString()).toBe('STANDARD');
    });

    it('should create VIP type from string', () => {
      const type = TicketType.fromString('VIP');

      expect(type).toBe(TicketType.VIP);
      expect(type.toString()).toBe('VIP');
    });

    it('should throw error for invalid type', () => {
      expect(() => TicketType.fromString('INVALID')).toThrow(
        'Invalid TicketType: INVALID',
      );
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance for same type', () => {
      const type1 = TicketType.fromString('STANDARD');
      const type2 = TicketType.fromString('STANDARD');

      expect(type1).toBe(type2);
    });
  });

  describe('equals', () => {
    it('should return true for same type', () => {
      const type1 = TicketType.STANDARD;
      const type2 = TicketType.STANDARD;

      expect(type1.equals(type2)).toBe(true);
    });

    it('should return false for different types', () => {
      const type1 = TicketType.STANDARD;
      const type2 = TicketType.VIP;

      expect(type1.equals(type2)).toBe(false);
    });
  });

  describe('convenience methods', () => {
    it('should check if type is standard', () => {
      expect(TicketType.STANDARD.isStandard()).toBe(true);
      expect(TicketType.VIP.isStandard()).toBe(false);
    });

    it('should check if type is vip', () => {
      expect(TicketType.VIP.isVip()).toBe(true);
      expect(TicketType.STANDARD.isVip()).toBe(false);
    });
  });

  describe('getAllTypes', () => {
    it('should return all ticket types', () => {
      const types = TicketType.getAllTypes();

      expect(types).toHaveLength(2);
      expect(types).toContain(TicketType.STANDARD);
      expect(types).toContain(TicketType.VIP);
    });
  });

  describe('getAllValues', () => {
    it('should return all ticket type values', () => {
      const values = TicketType.getAllValues();

      expect(values).toEqual(['STANDARD', 'VIP']);
    });
  });
});
