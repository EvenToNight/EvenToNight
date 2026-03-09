import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { UserRepositoryImpl } from 'src/tickets/infrastructure/persistence/repositories/user.repository';
import {
  UserDocument,
  UserSchema,
} from 'src/tickets/infrastructure/persistence/schemas/user.schema';
import { User } from 'src/tickets/domain/aggregates/user.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { Language } from 'src/tickets/domain/value-objects/language.vo';

describe('UserRepositoryImpl (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repo: UserRepositoryImpl;
  let userModel: Model<UserDocument>;

  const makeUser = (id = 'user-1', language = 'en'): User =>
    User.create(UserId.fromString(id), Language.fromString(language));

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: UserDocument.name, schema: UserSchema },
        ]),
      ],
      providers: [UserRepositoryImpl],
    }).compile();

    repo = module.get(UserRepositoryImpl);
    userModel = module.get<Model<UserDocument>>(
      getModelToken(UserDocument.name),
    );
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe('save + findById', () => {
    it('throws UserAlreadyExistsException when saving a duplicate', async () => {
      const { UserAlreadyExistsException } =
        await import('src/tickets/domain/exceptions/user-already-exists.exception');
      const user = makeUser('user-dup');
      await repo.save(user);
      await expect(repo.save(user)).rejects.toBeInstanceOf(
        UserAlreadyExistsException,
      );
    });

    it('rethrows non-duplicate errors from save', async () => {
      const genericError = new Error('Unexpected DB failure');
      const spy = jest
        .spyOn(userModel.prototype, 'save')
        .mockRejectedValueOnce(genericError);
      const user = makeUser('user-err');
      await expect(repo.save(user)).rejects.toThrow('Unexpected DB failure');
      spy.mockRestore();
    });

    it('saves a user and retrieves it by ID', async () => {
      const user = makeUser('user-save', 'it');
      await repo.save(user);

      const found = await repo.findById('user-save');
      expect(found).not.toBeNull();
      expect(found!.getId().toString()).toBe('user-save');
      expect(found!.getLanguage().getCode()).toBe('it');
    });

    it('returns null for a non-existent ID', async () => {
      const result = await repo.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates and returns the modified user', async () => {
      const user = makeUser('user-upd', 'en');
      await repo.save(user);
      user.changeLanguage(Language.fromString('fr'));

      const updated = await repo.update(user);
      expect(updated.getLanguage().getCode()).toBe('fr');

      const fromDb = await repo.findById('user-upd');
      expect(fromDb!.getLanguage().getCode()).toBe('fr');
    });

    it('throws when updating a non-existent user', async () => {
      const ghost = makeUser('ghost-user');
      await expect(repo.update(ghost)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('deletes a user; findById returns null afterwards', async () => {
      const user = makeUser('user-del');
      await repo.save(user);

      await repo.delete('user-del');

      const found = await repo.findById('user-del');
      expect(found).toBeNull();
    });
  });
});
