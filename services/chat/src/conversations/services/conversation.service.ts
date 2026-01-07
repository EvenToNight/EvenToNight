import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { Conversation } from '../schemas/conversation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParticipantRole } from '../schemas/participant.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<any>,
    @InjectModel('Participant')
    private readonly participantModel: Model<any>,
  ) {}

  async createConversation(dto: CreateConversationDto): Promise<Conversation> {
    const existingConversation = await this.conversationModel.findOne({
      organizationId: dto.organizationId,
      memberId: dto.memberId,
    });

    if (existingConversation) {
      throw new BadRequestException(
        'Conversation already exists between these users',
      );
    }

    const conversation = new this.conversationModel({
      organizationId: dto.organizationId,
      memberId: dto.memberId,
    });
    const savedConversation = await conversation.save();

    const orgParticipant = new this.participantModel({
      conversationId: savedConversation._id,
      userId: dto.organizationId,
      role: ParticipantRole.ORGANIZATION,
      unreadCount: 0,
      lastReadAt: new Date(),
    });

    const memberParticipant = new this.participantModel({
      conversationId: savedConversation._id,
      userId: dto.memberId,
      role: ParticipantRole.MEMBER,
      unreadCount: 0,
      lastReadAt: new Date(),
    });

    await Promise.all([orgParticipant.save(), memberParticipant.save()]);

    return savedConversation;
  }
}
