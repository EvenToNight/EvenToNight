import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { User, UserSchema } from '../../src/users/schemas/user.schema';

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
    it('should create a user with only userId', async () => {
      const user = new userModel({
        userId: 'user123',
      });

      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.userId).toBe('user123');
      expect(savedUser.name).toBeUndefined();
      expect(savedUser.avatar).toBeUndefined();
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should create a user with all fields', async () => {
      const user = new userModel({
        userId: 'user123',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      });

      const savedUser = await user.save();

      expect(savedUser.userId).toBe('user123');
      expect(savedUser.name).toBe('John Doe');
      expect(savedUser.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should fail without userId', async () => {
      const user = new userModel({
        name: 'John Doe',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with duplicate userId', async () => {
      const user1 = new userModel({
        userId: 'user123',
        name: 'John Doe',
      });
      await user1.save();

      const user2 = new userModel({
        userId: 'user123',
        name: 'Jane Doe',
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should allow empty string for name', async () => {
      const user = new userModel({
        userId: 'user123',
        name: '',
      });

      const savedUser = await user.save();
      expect(savedUser.name).toBe('');
    });

    it('should allow empty string for avatar', async () => {
      const user = new userModel({
        userId: 'user123',
        avatar: '',
      });

      const savedUser = await user.save();
      expect(savedUser.avatar).toBe('');
    });

    it('should allow null for optional fields', async () => {
      const user = new userModel({
        userId: 'user123',
        name: null,
        avatar: null,
      });

      const savedUser = await user.save();
      expect(savedUser.name).toBeNull();
      expect(savedUser.avatar).toBeNull();
    });

    it('should update updatedAt on modification', async () => {
      const user = new userModel({
        userId: 'user123',
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

    it('should handle long userId', async () => {
      const longUserId = 'a'.repeat(500);
      const user = new userModel({
        userId: longUserId,
      });

      const savedUser = await user.save();
      expect(savedUser.userId).toBe(longUserId);
      expect(savedUser.userId.length).toBe(500);
    });

    it('should handle special characters in fields', async () => {
      const user = new userModel({
        userId: 'user-123_ABC@domain',
        name: 'John Doe <script>alert("test")</script>',
        avatar: 'https://example.com/avatar?param=value&other=123',
      });

      const savedUser = await user.save();
      expect(savedUser.userId).toBe('user-123_ABC@domain');
      expect(savedUser.name).toBe('John Doe <script>alert("test")</script>');
      expect(savedUser.avatar).toBe(
        'https://example.com/avatar?param=value&other=123',
      );
    });

    it('should handle unicode characters in name', async () => {
      const user = new userModel({
        userId: 'user123',
        name: 'José García 日本語 emoji 👋',
      });

      const savedUser = await user.save();
      expect(savedUser.name).toBe('José García 日本語 emoji 👋');
    });
  });

  describe('Indexes', () => {
    it('should have unique index on userId', () => {
      const indexes = userModel.schema.indexes();
      const hasUserIdIndex = indexes.some(
        (index: any) => index[0].userId === 1 && index[1]?.unique === true,
      );
      expect(hasUserIdIndex).toBe(true);
    });

    it('should enforce unique constraint on userId', async () => {
      const user1 = new userModel({
        userId: 'user123',
        name: 'User 1',
      });
      await user1.save();

      const user2 = new userModel({
        userId: 'user123',
        name: 'User 2',
      });

      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Update operations', () => {
    it('should update name only', async () => {
      const user = new userModel({
        userId: 'user123',
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
      });
      await user.save();

      const updated = await userModel.findOneAndUpdate(
        { userId: 'user123' },
        { name: 'Jane Doe' },
        { new: true },
      );

      expect(updated.name).toBe('Jane Doe');
      expect(updated.avatar).toBe('https://example.com/avatar1.jpg');
    });

    it('should update avatar only', async () => {
      const user = new userModel({
        userId: 'user123',
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
      });
      await user.save();

      const updated = await userModel.findOneAndUpdate(
        { userId: 'user123' },
        { avatar: 'https://example.com/avatar2.jpg' },
        { new: true },
      );

      expect(updated.name).toBe('John Doe');
      expect(updated.avatar).toBe('https://example.com/avatar2.jpg');
    });

    it('should update both name and avatar', async () => {
      const user = new userModel({
        userId: 'user123',
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
      });
      await user.save();

      const updated = await userModel.findOneAndUpdate(
        { userId: 'user123' },
        { name: 'Jane Doe', avatar: 'https://example.com/avatar2.jpg' },
        { new: true },
      );

      expect(updated.name).toBe('Jane Doe');
      expect(updated.avatar).toBe('https://example.com/avatar2.jpg');
    });

    it('should handle upsert operation', async () => {
      const updated = await userModel.findOneAndUpdate(
        { userId: 'newuser123' },
        { userId: 'newuser123', name: 'New User' },
        { upsert: true, new: true },
      );

      expect(updated.userId).toBe('newuser123');
      expect(updated.name).toBe('New User');

      const count = await userModel.countDocuments({ userId: 'newuser123' });
      expect(count).toBe(1);
    });
  });

  describe('Delete operations', () => {
    it('should delete a user', async () => {
      const user = new userModel({
        userId: 'user123',
        name: 'John Doe',
      });
      await user.save();

      await userModel.deleteOne({ userId: 'user123' });

      const found = await userModel.findOne({ userId: 'user123' });
      expect(found).toBeNull();
    });

    it('should delete multiple users', async () => {
      await userModel.insertMany([
        { userId: 'user1', name: 'User 1' },
        { userId: 'user2', name: 'User 2' },
        { userId: 'user3', name: 'User 3' },
      ]);

      await userModel.deleteMany({ userId: { $in: ['user1', 'user3'] } });

      const remaining = await userModel.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].userId).toBe('user2');
    });
  });

  describe('Query operations', () => {
    beforeEach(async () => {
      await userModel.insertMany([
        {
          userId: 'user1',
          name: 'Alice',
          avatar: 'https://example.com/alice.jpg',
        },
        { userId: 'user2', name: 'Bob', avatar: 'https://example.com/bob.jpg' },
        { userId: 'user3', name: 'Charlie' },
        {
          userId: 'org1',
          name: 'Organization A',
          avatar: 'https://example.com/org.jpg',
        },
      ]);
    });

    it('should find user by userId', async () => {
      const user = await userModel.findOne({ userId: 'user1' });

      expect(user).toBeDefined();
      expect(user.name).toBe('Alice');
    });

    it('should find multiple users by userId array', async () => {
      const users = await userModel.find({
        userId: { $in: ['user1', 'user2', 'org1'] },
      });

      expect(users).toHaveLength(3);
      const userIds = users.map((u) => u.userId);
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
      const charlie = users.find((u) => u.userId === 'user3');
      expect(charlie).toBeDefined();
    });

    it('should count users', async () => {
      const count = await userModel.countDocuments({});
      expect(count).toBe(4);
    });

    it('should check if user exists', async () => {
      const exists = await userModel.exists({ userId: 'user1' });
      expect(exists).toBeTruthy();

      const notExists = await userModel.exists({ userId: 'nonexistent' });
      expect(notExists).toBeNull();
    });
  });
});
