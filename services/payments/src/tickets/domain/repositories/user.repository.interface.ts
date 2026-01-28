import { User } from '../aggregates/user.aggregate';

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  isDuplicateError(error: unknown): boolean;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
