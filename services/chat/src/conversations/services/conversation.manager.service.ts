import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Conversation } from '../schemas/conversation.schema';
import { ParticipantRole } from '../schemas/participant.schema';
import { UsersService } from 'src/users/services/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from 'src/users/schemas/user.schema';
import { DataMapperService } from './data-mapper.service';
import { UserID } from '../types';

@Injectable()
export class ConversationManagerService {
  constructor(
    @InjectModel('Participant') private readonly participantModel: Model<any>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<any>,
    private readonly usersService: UsersService,
    private readonly dataMapperService: DataMapperService,
  ) {}

  async findOrCreateConversation(
    userId1: string,
    userId2: string,
    session?: ClientSession,
  ): Promise<any> {
    const { organizationId, userId } = await this.determineRoles(
      userId1,
      userId2,
    );

    let conversation = await this.findConversationBetweenUsers(
      organizationId,
      userId,
      session,
    );

    if (!conversation) {
      conversation = await this.createNewConversation(
        organizationId,
        userId,
        session,
      );
    }

    return conversation;
  }

  async findConversationBetweenUsers(
    organizationId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<Conversation | null> {
    return this.conversationModel
      .findOne({ organizationId, userId })
      .session(session || null);
  }

  private async createNewConversation(
    organizationId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<any> {
    const conversation = await new this.conversationModel({
      organizationId,
      userId,
    }).save({ session });

    await this.createParticipantsForConversation(
      conversation._id,
      organizationId,
      userId,
      session,
    );

    return conversation;
  }

  private async createParticipantsForConversation(
    conversationId: Types.ObjectId,
    organizationId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<void> {
    const [orgName, userName] = await Promise.all([
      this.usersService.getUsername(organizationId),
      this.usersService.getUsername(userId),
    ]);

    const [orgInfo, userInfo] = await this.dataMapperService.fetchUsersInfo(
      organizationId,
      userId,
    );

    const orgParticipant = new this.participantModel({
      conversationId,
      userId: organizationId,
      userName: orgName || 'Unknown User',
      role:
        orgInfo?.role === UserRole.ORGANIZATION
          ? ParticipantRole.ORGANIZATION
          : ParticipantRole.MEMBER,
      unreadCount: 0,
      lastReadAt: new Date(),
    });

    const userParticipant = new this.participantModel({
      conversationId,
      userId: userId,
      userName: userName || 'Unknown User',
      role:
        userInfo?.role === UserRole.ORGANIZATION
          ? ParticipantRole.ORGANIZATION
          : ParticipantRole.MEMBER,
      unreadCount: 0,
      lastReadAt: new Date(),
    });

    await Promise.all([
      orgParticipant.save({ session }),
      userParticipant.save({ session }),
    ]);
  }

  async validateConversationExists(conversationId: string): Promise<any> {
    this.validateObjectId(conversationId);
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async validateUserIsParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const isParticipant = await this.verifyUserInConversation(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new BadRequestException(
        'User is not a participant of this conversation',
      );
    }
  }

  async verifyUserInConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    await this.validateUserExists(userId);
    const participant = await this.participantModel.findOne({
      conversationId: new Types.ObjectId(conversationId),
      userId,
    });
    return !!participant;
  }

  private async determineRoles(
    userId1: UserID,
    userId2: UserID,
  ): Promise<{ organizationId: string; userId: string }> {
    const [user1Info, user2Info] = await this.dataMapperService.fetchUsersInfo(
      userId1,
      userId2,
    );

    if (!user1Info) {
      throw new BadRequestException(`User ${userId1} does not exist`);
    }
    if (!user2Info) {
      throw new BadRequestException(`User ${userId2} does not exist`);
    }

    const isUser1Org = user1Info.role === UserRole.ORGANIZATION;
    const isUser2Org = user2Info.role === UserRole.ORGANIZATION;
    const isUser1Member = user1Info.role === UserRole.MEMBER;
    const isUser2Member = user2Info.role === UserRole.MEMBER;

    if (isUser1Member && isUser2Member) {
      throw new BadRequestException(
        'Conversations between two members are not allowed',
      );
    }

    if (isUser1Org && isUser2Org) {
      if (userId1 < userId2) {
        return { organizationId: userId1, userId: userId2 };
      } else {
        return { organizationId: userId2, userId: userId1 };
      }
    }

    if (isUser1Org && isUser2Member) {
      return { organizationId: userId1, userId: userId2 };
    }

    if (isUser1Member && isUser2Org) {
      return { organizationId: userId2, userId: userId1 };
    }

    throw new BadRequestException('Invalid user roles for conversation');
  }

  async validateUserExists(userId: string): Promise<void> {
    const exists = await this.usersService.userExists(userId);
    if (!exists) {
      throw new BadRequestException(`User ${userId} does not exist`);
    }
  }

  validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid conversation ID');
    }
  }

  async fetchUserParticipants(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    return this.participantModel.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conversationId',
        },
      },
      { $unwind: '$conversationId' },
      { $sort: { 'conversationId.updatedAt': -1 } },
      { $skip: offset },
      { $limit: limit + 1 },
    ]);
  }

  async ensureConversationDoesNotExist(
    recipientId: string,
    senderId: string,
    session?: ClientSession,
  ): Promise<void> {
    const existing = await this.findConversationBetweenUsers(
      recipientId,
      senderId,
      session,
    );
    if (existing) {
      throw new BadRequestException(
        'Conversation already exists. Use the existing conversation endpoint.',
      );
    }
  }

  async findConversationOrThrow(conversationId: string): Promise<any> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  async findParticipant(conversationId: string, userId: string): Promise<any> {
    return this.participantModel.findOne({
      conversationId: new Types.ObjectId(conversationId),
      userId,
    });
  }
}
