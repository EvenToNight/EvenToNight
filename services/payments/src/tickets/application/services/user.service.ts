import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from 'src/tickets/domain/repositories/user.repository.interface';
import { type SupportedLanguage } from 'src/tickets/domain/value-objects/language.vo';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async getUserLanguage(userId: string): Promise<SupportedLanguage> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user.getLanguage().getCode();
  }
}
