import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  ): Promise<any> {
    // TODO: implement real roles assignments
    // const {organizationId, memberId} = await this.determineRoles(userId1, userId2);
    const organizationId = userId2;
    const memberId = userId1;

    let conversation = await this.findConversationBetweenUsers(
      organizationId,
      memberId,
    );

    if (!conversation) {
      conversation = await this.createNewConversation(organizationId, memberId);
    }

    return conversation;
  }

  async findConversationBetweenUsers(
    organizationId: string,
    memberId: string,
  ): Promise<Conversation | null> {
    return this.conversationModel.findOne({ organizationId, memberId });
  }

  private async createNewConversation(
    organizationId: string,
    memberId: string,
  ): Promise<any> {
    const conversation = await new this.conversationModel({
      organizationId,
      memberId,
    }).save();

    await this.createParticipantsForConversation(
      conversation._id,
      organizationId,
      memberId,
    );

    return conversation;
  }

  private async createParticipantsForConversation(
    conversationId: Types.ObjectId,
    organizationId: string,
    memberId: string,
  ): Promise<void> {
    const [orgName, memberName] = await Promise.all([
      this.usersService.getUsername(organizationId),
      this.usersService.getUsername(memberId),
    ]);

    const orgParticipant = new this.participantModel({
      conversationId,
      userId: organizationId,
      userName: orgName || 'Organization',
      role: ParticipantRole.ORGANIZATION,
      unreadCount: 0,
      lastReadAt: new Date(),
    });

    const memberParticipant = new this.participantModel({
      conversationId,
      userId: memberId,
      userName: memberName || 'Member',
      role: ParticipantRole.MEMBER,
      unreadCount: 0,
      lastReadAt: new Date(),
    });

    await Promise.all([orgParticipant.save(), memberParticipant.save()]);
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
  ): Promise<{ organizationId: string; memberId: string }> {
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

    if (isUser1Org && isUser2Member) {
      return { organizationId: userId1, memberId: userId2 };
    }

    if (isUser1Member && isUser2Org) {
      return { organizationId: userId2, memberId: userId1 };
    }

    throw new BadRequestException(
      'Conversation must be between an organization and a member',
    );
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
}
