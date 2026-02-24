import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import {
  Conversation,
  ConversationSchema,
} from '../../src/conversations/schemas/conversation.schema';

describe('ConversationSchema', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let conversationModel: Model<any>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    conversationModel = mongoConnection.model(
      Conversation.name,
      ConversationSchema,
    );
    await conversationModel.createIndexes();
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
    it('should create a conversation with required fields', async () => {
      const validConversation = new conversationModel({
        organizationId: 'org123',
        userId: 'member456',
      });

      const savedConversation = await validConversation.save();

      expect(savedConversation._id).toBeDefined();
      expect(savedConversation.organizationId).toBe('org123');
      expect(savedConversation.userId).toBe('member456');
      expect(savedConversation.createdAt).toBeDefined();
      expect(savedConversation.updatedAt).toBeDefined();
    });

    it('should fail without organizationId', async () => {
      const invalidConversation = new conversationModel({
        userId: 'member456',
      });

      await expect(invalidConversation.save()).rejects.toThrow();
    });

    it('should fail without userId', async () => {
      const invalidConversation = new conversationModel({
        organizationId: 'org123',
      });

      await expect(invalidConversation.save()).rejects.toThrow();
    });

    it('should update updatedAt on modification', async () => {
      const conversation = new conversationModel({
        organizationId: 'org123',
        userId: 'member456',
      });

      const saved = await conversation.save();
      const originalUpdatedAt = saved.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      saved.organizationId = 'org999';
      const updated = await saved.save();

      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('Indexes', () => {
    it('should have index on organizationId', () => {
      const indexes = conversationModel.schema.indexes();
      const hasOrgIndex = indexes.some(
        (index: any) => index[0].organizationId === 1,
      );
      expect(hasOrgIndex).toBe(true);
    });

    it('should have index on userId', () => {
      const indexes = conversationModel.schema.indexes();
      const hasUserIndex = indexes.some((index: any) => index[0].userId === 1);
      expect(hasUserIndex).toBe(true);
    });

    it('should have unique compound index on organizationId and userId', () => {
      const indexes = conversationModel.schema.indexes();
      const hasCompoundIndex = indexes.some(
        (index: any) =>
          index[0].organizationId === 1 &&
          index[0].userId === 1 &&
          index[1]?.unique === true,
      );
      expect(hasCompoundIndex).toBe(true);
    });

    it('should prevent duplicate conversations between same users', async () => {
      const conversation1 = new conversationModel({
        organizationId: 'org123',
        userId: 'member456',
      });
      await conversation1.save();

      const conversation2 = new conversationModel({
        organizationId: 'org123',
        userId: 'member456',
      });

      await expect(conversation2.save()).rejects.toThrow();
    });
  });
});
