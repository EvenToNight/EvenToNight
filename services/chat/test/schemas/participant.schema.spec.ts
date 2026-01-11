import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect, Types } from 'mongoose';
import {
  Participant,
  ParticipantSchema,
  ParticipantRole,
} from '../../src/conversations/schemas/participant.schema';
import {
  Conversation,
  ConversationSchema,
} from '../../src/conversations/schemas/conversation.schema';

describe('ParticipantSchema', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let participantModel: Model<any>;
  let conversationModel: Model<any>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    participantModel = mongoConnection.model(
      Participant.name,
      ParticipantSchema,
    );
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

    it('should create a participant with required fields', async () => {
      const validParticipant = new participantModel({
        conversationId,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
      });

      const savedParticipant = await validParticipant.save();

      expect(savedParticipant._id).toBeDefined();
      expect(savedParticipant.conversationId.toString()).toBe(
        conversationId.toString(),
      );
      expect(savedParticipant.userId).toBe('user123');
      expect(savedParticipant.role).toBe(ParticipantRole.MEMBER);
      expect(savedParticipant.unreadCount).toBe(0);
      expect(savedParticipant.lastReadAt).toBeDefined();
    });

    it('should fail without conversationId', async () => {
      const invalidParticipant = new participantModel({
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
      });

      await expect(invalidParticipant.save()).rejects.toThrow();
    });

    it('should fail without userId', async () => {
      const invalidParticipant = new participantModel({
        conversationId,
        userName: 'userName',
        role: ParticipantRole.MEMBER,
      });

      await expect(invalidParticipant.save()).rejects.toThrow();
    });

    it('should fail without role', async () => {
      const invalidParticipant = new participantModel({
        conversationId,
        userName: 'userName',
        userId: 'user123',
      });

      await expect(invalidParticipant.save()).rejects.toThrow();
    });

    it('should only accept valid ParticipantRole enum values', async () => {
      const invalidParticipant = new participantModel({
        conversationId,
        userId: 'user123',
        userName: 'userName',
        role: 'invalid_role',
      });

      await expect(invalidParticipant.save()).rejects.toThrow();
    });

    it('should accept MEMBER role', async () => {
      const participant = new participantModel({
        conversationId,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
      });

      const saved = await participant.save();
      expect(saved.role).toBe(ParticipantRole.MEMBER);
    });

    it('should accept ORGANIZATION role', async () => {
      const participant = new participantModel({
        conversationId,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.ORGANIZATION,
      });

      const saved = await participant.save();
      expect(saved.role).toBe(ParticipantRole.ORGANIZATION);
    });

    it('should set default unreadCount to 0', async () => {
      const participant = new participantModel({
        conversationId,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
      });

      const saved = await participant.save();
      expect(saved.unreadCount).toBe(0);
    });

    it('should allow custom unreadCount', async () => {
      const participant = new participantModel({
        conversationId,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
        unreadCount: 5,
      });

      const saved = await participant.save();
      expect(saved.unreadCount).toBe(5);
    });

    it('should set default lastReadAt to current date', async () => {
      const before = new Date();

      const participant = new participantModel({
        conversationId,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
      });

      const saved = await participant.save();
      const after = new Date();

      expect(saved.lastReadAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(saved.lastReadAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should allow custom lastReadAt', async () => {
      const customDate = new Date('2025-01-01');

      const participant = new participantModel({
        conversationId,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
        lastReadAt: customDate,
      });

      const saved = await participant.save();
      expect(saved.lastReadAt.getTime()).toBe(customDate.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have index on userId', () => {
      const indexes = participantModel.schema.indexes();
      const hasUserIdIndex = indexes.some(
        (index: any) => index[0].userId === 1,
      );
      expect(hasUserIdIndex).toBe(true);
    });

    it('should have index on conversationId', () => {
      const indexes = participantModel.schema.indexes();
      const hasConversationIdIndex = indexes.some(
        (index: any) => index[0].conversationId === 1,
      );
      expect(hasConversationIdIndex).toBe(true);
    });

    it('should have unique compound index on conversationId and userId', () => {
      const indexes = participantModel.schema.indexes();
      const hasCompoundIndex = indexes.some(
        (index: any) =>
          index[0].conversationId === 1 &&
          index[0].userId === 1 &&
          index[1]?.unique === true,
      );
      expect(hasCompoundIndex).toBe(true);
    });

    it('should prevent duplicate participants in same conversation', async () => {
      const conversation = new conversationModel({
        organizationId: 'org123',
        memberId: 'member456',
      });
      const saved = await conversation.save();

      const participant1 = new participantModel({
        conversationId: saved._id,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
      });
      await participant1.save();

      const participant2 = new participantModel({
        conversationId: saved._id,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.ORGANIZATION,
      });

      await expect(participant2.save()).rejects.toThrow();
    });
  });

  describe('Population', () => {
    it('should populate conversationId reference', async () => {
      const conversation = new conversationModel({
        organizationId: 'org123',
        memberId: 'member456',
      });
      const savedConversation = await conversation.save();

      const participant = new participantModel({
        conversationId: savedConversation._id,
        userId: 'user123',
        userName: 'userName',
        role: ParticipantRole.MEMBER,
      });
      await participant.save();

      const populated = await participantModel
        .findOne({ userId: 'user123' })
        .populate('conversationId')
        .exec();

      expect(populated.conversationId).toBeDefined();
      expect(populated.conversationId.organizationId).toBe('org123');
      expect(populated.conversationId.memberId).toBe('member456');
    });
  });
});
