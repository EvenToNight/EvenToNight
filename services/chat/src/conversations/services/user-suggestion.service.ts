import { Injectable } from '@nestjs/common';
import { DataMapperService } from './data-mapper.service';
import { ConversationListResponse } from '../dto/conversation-list.response';
import { UsersService } from 'src/users/services/users.service';
import { UserRole } from 'src/users/schemas/user.schema';
import { ConversationListItemDTO } from '../dto/conversation-list-item.dto';

@Injectable()
export class UserSuggestionService {
  constructor(
    private readonly dataMapperService: DataMapperService,
    private readonly usersService: UsersService,
  ) {}

  async getSuggestedUsers(
    userId: string,
    options: {
      limit: number;
      offset: number;
      name?: string;
      recipientId?: string;
    },
  ): Promise<ConversationListResponse> {
    const currentUser = await this.usersService.getUserInfo(userId);

    // TODO: implement check of currentUser
    // if (!currentUser) {
    //   return { items: [], limit: options.limit, offset: options.offset, hasMore: false };
    // }
    const currentRole = currentUser ? currentUser.role : UserRole.MEMBER;

    const targetRole = this.getOppositeRole(currentRole);

    const suggestedUsers = await this.searchTargetUsers(
      userId,
      targetRole,
      options,
    );
    const limitedUsers = this.applyPagination(
      suggestedUsers,
      options.limit,
      options.offset,
    );

    const hasMore = limitedUsers.length > options.limit;
    const items = limitedUsers.slice(0, options.limit);

    const suggestions = await this.dataMapperService.buildSuggestions(
      items,
      userId,
    );

    console.log('Get suggested users', suggestions);

    return {
      items: suggestions,
      limit: options.limit,
      offset: options.offset,
      hasMore,
    };
  }

  async searchTargetUsers(
    userId: string,
    targetRole: UserRole,
    options: { name?: string; recipientId?: string },
  ): Promise<any[]> {
    const userQuery: any = {
      userId: { $ne: userId },
      role: targetRole,
    };

    if (options.name) {
      userQuery.name = { $regex: options.name, $options: 'i' };
    }

    if (options.recipientId) {
      userQuery.userId = { $regex: `^${options.recipientId}`, $options: 'i' };
    }

    return this.usersService.searchUsers(userQuery);
  }

  private filterExistingSuggestions(
    items: ConversationListItemDTO[],
    existingPartnerIds: Set<string>,
    userId: string,
  ): ConversationListItemDTO[] {
    return items.filter((item) => {
      const partnerId =
        item.organization.id === userId ? item.member.id : item.organization.id;
      return !existingPartnerIds.has(partnerId);
    });
  }

  private extractPartnerIds(
    conversations: ConversationListItemDTO[],
    userId: string,
  ): Set<string> {
    return new Set(
      conversations.map((c) =>
        c.organization.id === userId ? c.member.id : c.organization.id,
      ),
    );
  }

  private getOppositeRole(role: UserRole): UserRole {
    return role === UserRole.MEMBER ? UserRole.ORGANIZATION : UserRole.MEMBER;
  }

  private applyPagination<T>(items: T[], limit: number, offset: number): T[] {
    return items.slice(offset, offset + limit + 1);
  }

  async addSuggestionsIfNeeded(
    conversations: ConversationListItemDTO[],
    userId: string,
    limit: number,
    name?: string,
    recipientId?: string,
  ): Promise<void> {
    const remainingSlots = limit - conversations.length;

    if (remainingSlots <= 0) return;

    const suggestedResult = await this.getSuggestedUsers(userId, {
      limit: remainingSlots,
      offset: 0,
      name,
      recipientId,
    });

    const existingPartnerIds = this.extractPartnerIds(conversations, userId);
    const newSuggestions = this.filterExistingSuggestions(
      suggestedResult.items,
      existingPartnerIds,
      userId,
    );

    conversations.push(...newSuggestions.slice(0, remainingSlots));
  }
}
