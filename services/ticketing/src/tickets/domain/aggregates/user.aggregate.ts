import { UserId } from '../value-objects/user-id.vo';
import { Language } from '../value-objects/language.vo';

export class User {
  private constructor(
    private readonly id: UserId,
    private language: Language,
  ) {}

  static create(id: UserId, language: Language): User {
    return new User(id, language);
  }

  changeLanguage(newLanguage: Language): void {
    this.language = newLanguage;
  }

  getId(): UserId {
    return this.id;
  }

  getLanguage(): Language {
    return this.language;
  }
}
