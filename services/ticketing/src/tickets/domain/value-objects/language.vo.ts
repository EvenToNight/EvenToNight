import { InvalidLanguageException } from '../exceptions/invalid-language.exception';

const SUPPORTED_LANGUAGES = ['it', 'en', 'es', 'fr', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export class Language {
  static readonly DEFAULT = new Language('en');

  private constructor(private readonly code: SupportedLanguage) {}

  static fromString(value: string): Language {
    const normalized = value.toLowerCase();
    if (!SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
      throw new InvalidLanguageException(value);
    }
    return new Language(normalized as SupportedLanguage);
  }

  static fromStringOrDefault(value: string): Language {
    const normalized = value.toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
      return new Language(normalized as SupportedLanguage);
    }
    return Language.DEFAULT;
  }

  static getSupportedLanguages(): readonly string[] {
    return SUPPORTED_LANGUAGES;
  }

  equals(other: Language): boolean {
    return this.code === other.code;
  }

  toString(): string {
    return this.code;
  }

  getCode(): SupportedLanguage {
    return this.code;
  }
}
