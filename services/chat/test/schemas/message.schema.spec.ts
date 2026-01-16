import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect, Types } from 'mongoose';
import {
  Message,
  MessageSchema,
} from '../../src/conversations/schemas/message.schema';
import {
  Conversation,
  ConversationSchema,
} from '../../src/conversations/schemas/conversation.schema';

describe('MessageSchema', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let messageModel: Model<any>;
  let conversationModel: Model<any>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    messageModel = mongoConnection.model(Message.name, MessageSchema);
    conversationModel = mongoConnection.model(
      Conversation.name,
      ConversationSchema,
    );
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
    let conversationId: Types.ObjectId;

    beforeEach(async () => {
      const conversation = new conversationModel({
        organizationId: 'org123',
        memberId: 'member456',
      });
      const saved = await conversation.save();
      conversationId = saved._id;
    });

    it('should create a message with required fields', async () => {
      const validMessage = new messageModel({
        conversationId,
        senderId: 'user123',
        content: 'Hello, this is a test message',
      });

      const savedMessage = await validMessage.save();

      expect(savedMessage._id).toBeDefined();
      expect(savedMessage.conversationId.toString()).toBe(
        conversationId.toString(),
      );
      expect(savedMessage.senderId).toBe('user123');
      expect(savedMessage.content).toBe('Hello, this is a test message');
      expect(savedMessage.createdAt).toBeDefined();
      expect(savedMessage.updatedAt).toBeDefined();
    });

    it('should fail without conversationId', async () => {
      const invalidMessage = new messageModel({
        senderId: 'user123',
        content: 'Hello',
      });

      await expect(invalidMessage.save()).rejects.toThrow();
    });

    it('should fail without senderId', async () => {
      const invalidMessage = new messageModel({
        conversationId,
        content: 'Hello',
      });

      await expect(invalidMessage.save()).rejects.toThrow();
    });

    it('should fail without content', async () => {
      const invalidMessage = new messageModel({
        conversationId,
        senderId: 'user123',
      });

      await expect(invalidMessage.save()).rejects.toThrow();
    });

    it('should not allow empty string content', async () => {
      const message = new messageModel({
        conversationId,
        senderId: 'user123',
        content: '',
      });

      await expect(message.save()).rejects.toThrow();
    });

    it('should allow very long content', async () => {
      const longContent = 'a'.repeat(10000);
      const message = new messageModel({
        conversationId,
        senderId: 'user123',
        content: longContent,
      });

      const saved = await message.save();
      expect(saved.content).toBe(longContent);
      expect(saved.content.length).toBe(10000);
    });

    it('should preserve special characters in content', async () => {
      const specialContent =
        'Hello! 👋 This has émojis & spëcial çhars <script>alert("test")</script>';
      const message = new messageModel({
        conversationId,
        senderId: 'user123',
        content: specialContent,
      });

      const saved = await message.save();
      expect(saved.content).toBe(specialContent);
    });

    it('should update updatedAt when modified', async () => {
      const message = new messageModel({
        conversationId,
        senderId: 'user123',
        content: 'Original content',
      });

      const saved = await message.save();
      const originalUpdatedAt = saved.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      saved.content = 'Modified content';
      const updated = await saved.save();

      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
      expect(updated.content).toBe('Modified content');
    });
  });

  describe('Indexes', () => {
    it('should have compound index on conversationId and createdAt', () => {
      const indexes = messageModel.schema.indexes();
      const hasCompoundIndex = indexes.some(
        (index: any) =>
          index[0].conversationId === 1 && index[0].createdAt === -1,
      );
      expect(hasCompoundIndex).toBe(true);
    });

    it('should have index on senderId', () => {
      const indexes = messageModel.schema.indexes();
      const hasSenderIndex = indexes.some(
        (index: any) => index[0].senderId === 1,
      );
      expect(hasSenderIndex).toBe(true);
    });
  });

  describe('Population', () => {
    it('should populate conversationId reference', async () => {
      const conversation = new conversationModel({
        organizationId: 'org123',
        memberId: 'member456',
      });
      const savedConversation = await conversation.save();

      const message = new messageModel({
        conversationId: savedConversation._id,
        senderId: 'user123',
        content: 'Test message',
      });
      await message.save();

      const populated = await messageModel
        .findOne({ senderId: 'user123' })
        .populate('conversationId')
        .exec();

      expect(populated.conversationId).toBeDefined();
      expect(populated.conversationId.organizationId).toBe('org123');
      expect(populated.conversationId.memberId).toBe('member456');
    });
  });

  describe('Querying messages', () => {
    let conversationId: Types.ObjectId;

    beforeEach(async () => {
      const conversation = new conversationModel({
        organizationId: 'org123',
        memberId: 'member456',
      });
      const saved = await conversation.save();
      conversationId = saved._id;

      for (let i = 0; i < 5; i++) {
        const message = new messageModel({
          conversationId,
          senderId: i % 2 === 0 ? 'user1' : 'user2',
          content: `Message ${i}`,
        });
        await message.save();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    });

    it('should retrieve messages ordered by createdAt descending', async () => {
      const messages = await messageModel
        .find({ conversationId })
        .sort({ createdAt: -1 })
        .exec();

      expect(messages).toHaveLength(5);
      expect(messages[0].content).toBe('Message 4');
      expect(messages[4].content).toBe('Message 0');
    });

    it('should retrieve messages for specific sender', async () => {
      const messages = await messageModel.find({ senderId: 'user1' }).exec();

      expect(messages).toHaveLength(3);
      messages.forEach((msg) => {
        expect(msg.senderId).toBe('user1');
      });
    });

    it('should support pagination', async () => {
      const limit = 2;
      const skip = 1;

      const messages = await messageModel
        .find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Message 3');
      expect(messages[1].content).toBe('Message 2');
    });
  });
});
