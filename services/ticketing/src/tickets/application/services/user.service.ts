import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from 'src/tickets/domain/repositories/user.repository.interface';
import { User } from 'src/tickets/domain/aggregates/user.aggregate';
import { type SupportedLanguage } from 'src/tickets/domain/value-objects/language.vo';
import { UserNotFoundException } from 'src/tickets/domain/exceptions/user-not-found.exception';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async getUserLanguage(userId: string): Promise<SupportedLanguage> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return user.getLanguage().getCode();
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(user: User): Promise<User> {
    return this.userRepository.update(user);
  }

  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
