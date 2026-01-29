import { Injectable } from '@nestjs/common';
import { ConversationListItemDTO } from '../dto/conversation-list-item.dto';
import { ConversationDetailDTO } from '../dto/conversation-details.dto';
import { MessageDTO } from '../dto/message.dto';
import { UsersService } from '../../users/services/users.service';
import { ParticipantRole } from '../schemas/participant.schema';
import { UserRole } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../schemas/message.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class DataMapperService {
  private readonly DEFAULT_AVATAR =
    'https://media.eventonight.site/users/default.jpg';

  constructor(
    private readonly usersService: UsersService,
    @InjectModel(Message.name) private readonly messageModel: Model<any>,
  ) {}

  async buildConversationListItems(
    participants: any[],
  ): Promise<ConversationListItemDTO[]> {
    const conversationIds = participants.map((p) => p.conversationId._id);
    const userIdsSet = new Set<string>();
    participants.forEach((p) => {
      userIdsSet.add(p.conversationId.organizationId);
      userIdsSet.add(p.conversationId.memberId);
    });
    const userIds = Array.from(userIdsSet);

    const lastMessages = await this.messageModel.aggregate([
      { $match: { conversationId: { $in: conversationIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          content: { $first: '$content' },
          senderId: { $first: '$senderId' },
          createdAt: { $first: '$createdAt' },
        },
      },
    ]);
    const lastMessageMap = new Map(
      lastMessages.map((msg) => [String(msg._id), msg]),
    );

    const usersInfoArr = await this.fetchMultipleUsersInfo(userIds);
    const usersInfoMap = new Map(usersInfoArr.map((u) => [u.id, u]));

    return participants.map((participant) => {
      const conversation = participant.conversationId;
      const lastMessage = lastMessageMap.get(String(conversation._id));
      const orgInfo = usersInfoMap.get(conversation.organizationId);
      const memberInfo = usersInfoMap.get(conversation.memberId);
      return {
        id: conversation._id.toString(),
        organization: this.buildUserInfo(conversation.organizationId, orgInfo),
        member: this.buildUserInfo(conversation.memberId, memberInfo),
        lastMessage: this.buildLastMessageInfo(lastMessage),
        unreadCount: participant.unreadCount,
      };
    });
  }

  async buildConversationDetail(
    conversation: any,
  ): Promise<ConversationDetailDTO> {
    const [orgInfo, memberInfo] = await this.fetchUsersInfo(
      conversation.organizationId,
      conversation.memberId,
    );

    return {
      id: conversation._id.toString(),
      organization: this.buildUserInfo(conversation.organizationId, orgInfo),
      member: this.buildUserInfo(conversation.memberId, memberInfo),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async buildMessageDTOs(
    messages: any[],
    conversationId: string,
    participant: any,
  ): Promise<MessageDTO[]> {
    const senderIds = [...new Set(messages.map((msg) => msg.senderId))];
    const usersInfo = await this.fetchMultipleUsersInfo(senderIds);
    const usersMap = new Map(usersInfo.map((user) => [user.id, user]));

    return messages.map((message) => {
      const senderInfo = usersMap.get(message.senderId);

      return {
        id: message._id.toString(),
        conversationId,
        sender: {
          id: message.senderId,
          name: senderInfo?.name || 'Unknown User',
          avatar: senderInfo?.avatar || this.DEFAULT_AVATAR,
        },
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.createdAt <= participant.lastReadAt,
      };
    });
  }

  async buildSearchResultItem(
    conversation: any,
    participant: any,
    partnerParticipant: any,
    lastMessage: any,
    userId: string,
  ): Promise<ConversationListItemDTO> {
    const [myUserInfo, partnerUserInfo] = await this.fetchUsersInfo(
      userId,
      partnerParticipant.userId,
    );

    const isPartnerOrganization =
      partnerParticipant.role === ParticipantRole.ORGANIZATION;

    return {
      id: conversation._id.toString(),
      organization: isPartnerOrganization
        ? {
            id: partnerParticipant.userId,
            name: partnerParticipant.userName,
            avatar: partnerUserInfo?.avatar || this.DEFAULT_AVATAR,
          }
        : {
            id: userId,
            name: participant.userName,
            avatar: myUserInfo?.avatar || this.DEFAULT_AVATAR,
          },
      member: !isPartnerOrganization
        ? {
            id: partnerParticipant.userId,
            name: partnerParticipant.userName,
            avatar: partnerUserInfo?.avatar || this.DEFAULT_AVATAR,
          }
        : {
            id: userId,
            name: participant.userName,
            avatar: myUserInfo?.avatar || this.DEFAULT_AVATAR,
          },
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            senderId: lastMessage.senderId.toString(),
            timestamp: lastMessage.createdAt,
          }
        : null,
      unreadCount: participant.unreadCount,
    };
  }

  async buildSuggestions(
    users: any[],
    userId: string,
  ): Promise<ConversationListItemDTO[]> {
    const myUserInfo = await this.usersService.getUserInfo(userId);

    return users.map((user) => ({
      id: null,
      organization: this.buildSuggestionUserInfo(
        user,
        UserRole.ORGANIZATION,
        userId,
        myUserInfo,
      ),
      member: this.buildSuggestionUserInfo(
        user,
        UserRole.MEMBER,
        userId,
        myUserInfo,
      ),
      lastMessage: null,
      unreadCount: 0,
    }));
  }

  private buildSuggestionUserInfo(
    user: any,
    roleToMatch: UserRole,
    currentUserId: string,
    currentUserInfo: any,
  ) {
    const isMatch = user.role === roleToMatch;

    return isMatch
      ? {
          id: user.id,
          name: user.name || 'Unknown',
          avatar: user.avatar || this.DEFAULT_AVATAR,
        }
      : {
          id: currentUserId,
          name: currentUserInfo?.name || 'Unknown',
          avatar: currentUserInfo?.avatar || this.DEFAULT_AVATAR,
        };
  }

  private buildUserInfo(userId: string, userInfo: any) {
    return {
      id: userId,
      name: userInfo?.name || 'Unknown',
      avatar: userInfo?.avatar || this.DEFAULT_AVATAR,
    };
  }

  private buildLastMessageInfo(lastMessage: any) {
    return lastMessage
      ? {
          content: lastMessage.content,
          senderId: String(lastMessage.senderId),
          timestamp: lastMessage.createdAt,
        }
      : {
          content: '',
          senderId: '',
          timestamp: new Date(0),
        };
  }

  async fetchUsersInfo(userId1: string, userId2: string): Promise<[any, any]> {
    return Promise.all([
      this.usersService.getUserInfo(userId1),
      this.usersService.getUserInfo(userId2),
    ]);
  }

  private async fetchMultipleUsersInfo(userIds: string[]): Promise<any[]> {
    return Promise.all(
      userIds.map(async (id) => {
        const user = await this.usersService.getUserInfo(id);
        return (
          user || {
            id: id,
            name: 'Unknown User',
            avatar: this.DEFAULT_AVATAR,
          }
        );
      }),
    );
  }

  private async findLastMessage(conversationId: Types.ObjectId): Promise<any> {
    return this.messageModel
      .findOne({ conversationId })
      .sort({ createdAt: -1 })
      .select('content senderId createdAt')
      .exec();
  }
}
