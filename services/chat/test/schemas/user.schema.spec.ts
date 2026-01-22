import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import {
  User,
  UserSchema,
  UserRole,
} from '../../src/users/schemas/user.schema';

describe('UserSchema', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<any>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Schema validation', () => {
    it('should create a user with required fields', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
      });

      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.id).toBe('user123');
      expect(savedUser.role).toBe(UserRole.MEMBER);
      expect(savedUser.name).toBeUndefined();
      expect(savedUser.avatar).toBeUndefined();
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should create a user with all fields', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      });

      const savedUser = await user.save();

      expect(savedUser.id).toBe('user123');
      expect(savedUser.role).toBe(UserRole.MEMBER);
      expect(savedUser.name).toBe('John Doe');
      expect(savedUser.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should fail without id', async () => {
      const user = new userModel({
        role: UserRole.MEMBER,
        name: 'John Doe',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail without role', async () => {
      const user = new userModel({
        id: 'user123',
        name: 'John Doe',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with duplicate id', async () => {
      const user1 = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'John Doe',
      });
      await user1.save();

      const user2 = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'Jane Doe',
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should allow empty string for name', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: '',
      });

      const savedUser = await user.save();
      expect(savedUser.name).toBe('');
    });

    it('should allow empty string for avatar', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        avatar: '',
      });

      const savedUser = await user.save();
      expect(savedUser.avatar).toBe('');
    });

    it('should allow null for optional fields', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: null,
        avatar: null,
      });

      const savedUser = await user.save();
      expect(savedUser.name).toBeNull();
      expect(savedUser.avatar).toBeNull();
    });

    it('should update updatedAt on modification', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'John Doe',
      });

      const saved = await user.save();
      const originalUpdatedAt = saved.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      saved.name = 'Jane Doe';
      const updated = await saved.save();

      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
      expect(updated.name).toBe('Jane Doe');
    });

    it('should handle long id', async () => {
      const longId = 'a'.repeat(500);
      const user = new userModel({
        id: longId,
        role: UserRole.MEMBER,
      });

      const savedUser = await user.save();
      expect(savedUser.id).toBe(longId);
      expect(savedUser.id.length).toBe(500);
    });

    it('should handle special characters in fields', async () => {
      const user = new userModel({
        id: 'user-123_ABC@domain',
        role: UserRole.MEMBER,
        name: 'John Doe <script>alert("test")</script>',
        avatar: 'https://example.com/avatar?param=value&other=123',
      });

      const savedUser = await user.save();
      expect(savedUser.id).toBe('user-123_ABC@domain');
      expect(savedUser.name).toBe('John Doe <script>alert("test")</script>');
      expect(savedUser.avatar).toBe(
        'https://example.com/avatar?param=value&other=123',
      );
    });

    it('should handle unicode characters in name', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'José García 日本語 emoji 👋',
      });

      const savedUser = await user.save();
      expect(savedUser.name).toBe('José García 日本語 emoji 👋');
    });
  });

  describe('Indexes', () => {
    it('should have unique index on id', () => {
      const indexes = userModel.schema.indexes();
      const hasIdIndex = indexes.some(
        (index: any) => index[0].id === 1 && index[1]?.unique === true,
      );
      expect(hasIdIndex).toBe(true);
    });

    it('should have index on role', () => {
      const indexes = userModel.schema.indexes();
      const hasRoleIndex = indexes.some((index: any) => index[0].role === 1);
      expect(hasRoleIndex).toBe(true);
    });

    it('should enforce unique constraint on id', async () => {
      const user1 = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'User 1',
      });
      await user1.save();

      const user2 = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'User 2',
      });

      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Update operations', () => {
    it('should update name only', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
      });
      await user.save();

      const updated = await userModel.findOneAndUpdate(
        { id: 'user123' },
        { name: 'Jane Doe' },
        { new: true },
      );

      expect(updated.name).toBe('Jane Doe');
      expect(updated.avatar).toBe('https://example.com/avatar1.jpg');
      expect(updated.role).toBe(UserRole.MEMBER);
    });

    it('should update avatar only', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
      });
      await user.save();

      const updated = await userModel.findOneAndUpdate(
        { id: 'user123' },
        { avatar: 'https://example.com/avatar2.jpg' },
        { new: true },
      );

      expect(updated.name).toBe('John Doe');
      expect(updated.avatar).toBe('https://example.com/avatar2.jpg');
    });

    it('should update both name and avatar', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
      });
      await user.save();

      const updated = await userModel.findOneAndUpdate(
        { id: 'user123' },
        { name: 'Jane Doe', avatar: 'https://example.com/avatar2.jpg' },
        { new: true },
      );

      expect(updated.name).toBe('Jane Doe');
      expect(updated.avatar).toBe('https://example.com/avatar2.jpg');
    });

    it('should handle upsert operation', async () => {
      const updated = await userModel.findOneAndUpdate(
        { id: 'newuser123' },
        {
          id: 'newuser123',
          role: UserRole.MEMBER,
          name: 'New User',
        },
        { upsert: true, new: true },
      );

      expect(updated.id).toBe('newuser123');
      expect(updated.role).toBe(UserRole.MEMBER);
      expect(updated.name).toBe('New User');

      const count = await userModel.countDocuments({ id: 'newuser123' });
      expect(count).toBe(1);
    });
  });

  describe('Delete operations', () => {
    it('should delete a user', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'John Doe',
      });
      await user.save();

      await userModel.deleteOne({ id: 'user123' });

      const found = await userModel.findOne({ id: 'user123' });
      expect(found).toBeNull();
    });

    it('should delete multiple users', async () => {
      await userModel.insertMany([
        { id: 'user1', role: UserRole.MEMBER, name: 'User 1' },
        { id: 'user2', role: UserRole.MEMBER, name: 'User 2' },
        { id: 'user3', role: UserRole.MEMBER, name: 'User 3' },
      ]);

      await userModel.deleteMany({ id: { $in: ['user1', 'user3'] } });

      const remaining = await userModel.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('user2');
    });
  });

  describe('Query operations', () => {
    beforeEach(async () => {
      await userModel.insertMany([
        {
          id: 'user1',
          role: UserRole.MEMBER,
          name: 'Alice',
          avatar: 'https://example.com/alice.jpg',
        },
        {
          id: 'user2',
          role: UserRole.MEMBER,
          name: 'Bob',
          avatar: 'https://example.com/bob.jpg',
        },
        { id: 'user3', role: UserRole.MEMBER, name: 'Charlie' },
        {
          id: 'org1',
          role: UserRole.ORGANIZATION,
          name: 'Organization A',
          avatar: 'https://example.com/org.jpg',
        },
      ]);
    });

    it('should find user by id', async () => {
      const user = await userModel.findOne({ id: 'user1' });

      expect(user).toBeDefined();
      expect(user.name).toBe('Alice');
      expect(user.role).toBe(UserRole.MEMBER);
    });

    it('should find multiple users by id array', async () => {
      const users = await userModel.find({
        id: { $in: ['user1', 'user2', 'org1'] },
      });

      expect(users).toHaveLength(3);
      const userIds = users.map((u) => u.id);
      expect(userIds).toContain('user1');
      expect(userIds).toContain('user2');
      expect(userIds).toContain('org1');
    });

    it('should find users with avatar', async () => {
      const users = await userModel.find({
        avatar: { $exists: true, $nin: [null, '', undefined] },
      });

      expect(users.length).toBeGreaterThanOrEqual(3);
    });

    it('should find users without avatar', async () => {
      const users = await userModel.find({
        $or: [{ avatar: { $exists: false } }, { avatar: null }, { avatar: '' }],
      });

      expect(users.length).toBeGreaterThanOrEqual(1);
      const charlie = users.find((u) => u.id === 'user3');
      expect(charlie).toBeDefined();
    });

    it('should count users', async () => {
      const count = await userModel.countDocuments({});
      expect(count).toBe(4);
    });

    it('should check if user exists', async () => {
      const exists = await userModel.exists({ id: 'user1' });
      expect(exists).toBeTruthy();

      const notExists = await userModel.exists({ id: 'nonexistent' });
      expect(notExists).toBeNull();
    });
  });

  describe('Role validation', () => {
    it('should create a user with MEMBER role', async () => {
      const user = new userModel({
        id: 'user123',
        role: UserRole.MEMBER,
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      });

      const savedUser = await user.save();

      expect(savedUser.role).toBe(UserRole.MEMBER);
    });

    it('should create a user with ORGANIZATION role', async () => {
      const user = new userModel({
        id: 'org123',
        role: UserRole.ORGANIZATION,
        name: 'Tech Org',
        avatar: 'https://example.com/org.jpg',
      });

      const savedUser = await user.save();

      expect(savedUser.role).toBe(UserRole.ORGANIZATION);
    });

    it('should fail with invalid role', async () => {
      const user = new userModel({
        id: 'user123',
        role: 'invalid_role',
        name: 'John Doe',
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Query by role', () => {
    beforeEach(async () => {
      await userModel.insertMany([
        {
          id: 'user1',
          role: UserRole.MEMBER,
          name: 'User 1',
          avatar: 'avatar1.jpg',
        },
        {
          id: 'user2',
          role: UserRole.MEMBER,
          name: 'User 2',
          avatar: 'avatar2.jpg',
        },
        {
          id: 'org1',
          role: UserRole.ORGANIZATION,
          name: 'Org 1',
          avatar: 'org1.jpg',
        },
        {
          id: 'org2',
          role: UserRole.ORGANIZATION,
          name: 'Org 2',
          avatar: 'org2.jpg',
        },
      ]);
    });

    it('should find all members', async () => {
      const members = await userModel.find({ role: UserRole.MEMBER });

      expect(members).toHaveLength(2);
      members.forEach((m) => expect(m.role).toBe(UserRole.MEMBER));
    });

    it('should find all organizations', async () => {
      const orgs = await userModel.find({ role: UserRole.ORGANIZATION });

      expect(orgs).toHaveLength(2);
      orgs.forEach((o) => expect(o.role).toBe(UserRole.ORGANIZATION));
    });

    it('should find users by role and other criteria', async () => {
      const membersWithAvatar = await userModel.find({
        role: UserRole.MEMBER,
        avatar: { $exists: true, $nin: [null, ''] },
      });

      expect(membersWithAvatar).toHaveLength(2);
      membersWithAvatar.forEach((m) => {
        expect(m.role).toBe(UserRole.MEMBER);
        expect(m.avatar).toBeTruthy();
      });
    });
  });
});
