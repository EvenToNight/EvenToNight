import { UserId } from '../../../domain/value-objects/user-id.vo';
import { User } from 'src/tickets/domain/aggregates/user.aggregate';
import { UserDocument } from '../schemas/user.schema';

export class UserMapper {
  static toDomain(document: UserDocument): User {
    return User.create(
      UserId.fromString(document._id.toString()),
      document.language,
    );
  }

  static toPersistence(user: User): Partial<UserDocument> {
    return {
      _id: user.getId() as any,
      language: user.getLanguage(),
    };
  }
}
