import { Language } from 'src/tickets/domain/value-objects/language.vo';
import { InvalidLanguageException } from 'src/tickets/domain/exceptions/invalid-language.exception';

describe('Language', () => {
  describe('fromString', () => {
    it('should create Language from valid code', () => {
      const lang = Language.fromString('en');
      expect(lang).toBeInstanceOf(Language);
      expect(lang.getCode()).toBe('en');
    });

    it('should normalize to lowercase', () => {
      const lang = Language.fromString('IT');
      expect(lang.getCode()).toBe('it');
    });

    it.each(['it', 'en', 'es', 'fr', 'de'])('should accept %s', (code) => {
      const lang = Language.fromString(code);
      expect(lang.getCode()).toBe(code);
    });

    it('should throw InvalidLanguageException for unsupported language', () => {
      expect(() => Language.fromString('zh')).toThrow(InvalidLanguageException);
    });

    it('should throw InvalidLanguageException for empty string', () => {
      expect(() => Language.fromString('')).toThrow(InvalidLanguageException);
    });
  });

  describe('fromStringOrDefault', () => {
    it('should return Language for valid code', () => {
      const lang = Language.fromStringOrDefault('it');
      expect(lang.getCode()).toBe('it');
    });

    it('should return DEFAULT for unsupported language', () => {
      const lang = Language.fromStringOrDefault('zh');
      expect(lang.getCode()).toBe('en');
    });

    it('should return DEFAULT for empty string', () => {
      const lang = Language.fromStringOrDefault('');
      expect(lang.getCode()).toBe('en');
    });
  });

  describe('DEFAULT', () => {
    it('should be en', () => {
      expect(Language.DEFAULT.getCode()).toBe('en');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return all supported languages', () => {
      const languages = Language.getSupportedLanguages();
      expect(languages).toHaveLength(5);
      expect(languages).toEqual(
        expect.arrayContaining(['it', 'en', 'es', 'fr', 'de']),
      );
    });
  });

  describe('equals', () => {
    it('should return true for same code', () => {
      const a = Language.fromString('en');
      const b = Language.fromString('en');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different codes', () => {
      const a = Language.fromString('en');
      const b = Language.fromString('it');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the code', () => {
      const lang = Language.fromString('fr');
      expect(lang.toString()).toBe('fr');
    });
  });
});
