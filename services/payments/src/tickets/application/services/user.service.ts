import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from 'src/tickets/domain/repositories/user.repository.interface';
import { SUPPORTED_LOCALES, SupportedLocale } from './ticket.translations';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async getUserLanguage(userId: string): Promise<SupportedLocale> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    if (SUPPORTED_LOCALES.includes(user.getLanguage() as SupportedLocale)) {
      return user.getLanguage() as SupportedLocale;
    } else {
      return 'en';
    }
  }
}
