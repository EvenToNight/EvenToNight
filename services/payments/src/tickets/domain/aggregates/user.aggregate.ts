import { randomUUID } from 'crypto';
import { UserId } from '../value-objects/user-id.vo';

export class User {
  private constructor(
    private readonly id: UserId,
    private language: string,
  ) {}

  static create(id: UserId, language: string): User {
    return new User(id || this.generateId(), language);
  }

  private static generateId(): string {
    return `user_${randomUUID()}`;
  }

  changeLanguage(newLanguage: string): void {
    this.language = newLanguage;
  }

  // Getters
  getId(): UserId {
    return this.id;
  }

  getLanguage(): string {
    return this.language;
  }
}
