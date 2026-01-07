import { BadRequestException, Injectable } from '@nestjs/common';
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

  private async findOrCreateConversation(
    organizationId: string,
    memberId: string,
  ): Promise<any> {
    // TODO: Check if organizationId and memberId exist

    let conversation = await this.conversationModel.findOne({
      organizationId,
      memberId,
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        organizationId,
        memberId,
      });
      const savedConversation = await conversation.save();

      const orgParticipant = new this.participantModel({
        conversationId: savedConversation._id,
        userId: organizationId,
        role: ParticipantRole.ORGANIZATION,
        unreadCount: 0,
        lastReadAt: new Date(),
      });

      const memberParticipant = new this.participantModel({
        conversationId: savedConversation._id,
        userId: memberId,
        role: ParticipantRole.MEMBER,
        unreadCount: 0,
        lastReadAt: new Date(),
      });

      await Promise.all([orgParticipant.save(), memberParticipant.save()]);

      conversation = savedConversation;
    }

    return conversation;
  }
}
