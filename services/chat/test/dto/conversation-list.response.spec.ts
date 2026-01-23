import { ConversationListResponse } from '../../src/conversations/dto/conversation-list.response';
import { ConversationListItemDTO } from '../../src/conversations/dto/conversation-list-item.dto';

describe('ConversationListResponse', () => {
  it('should conform to PaginatedResponse structure', () => {
    const item: ConversationListItemDTO = {
      id: 'conv123',
      organization: {
        id: 'org456',
        name: 'Test Org',
        avatar: 'https://example.com/avatar.jpg',
      },
      member: {
        id: 'member789',
        name: 'John Doe',
        avatar: 'https://example.com/john.jpg',
      },
      lastMessage: {
        content: 'Hello',
        senderId: 'member789',
        timestamp: new Date(),
      },
      unreadCount: 2,
    };

    const response: ConversationListResponse = {
      items: [item],
      limit: 20,
      offset: 0,
      hasMore: false,
    };

    expect(response.items).toHaveLength(1);
    expect(response.items[0].id).toBe('conv123');
    expect(response.limit).toBe(20);
    expect(response.offset).toBe(0);
    expect(response.hasMore).toBe(false);
  });

  it('should support empty conversations list', () => {
    const response: ConversationListResponse = {
      items: [],
      limit: 20,
      offset: 0,
      hasMore: false,
    };

    expect(response.items).toEqual([]);
    expect(response.items.length).toBe(0);
  });

  it('should support pagination with hasMore', () => {
    const items: ConversationListItemDTO[] = Array.from(
      { length: 20 },
      (_, i) => ({
        id: `conv${i}`,
        organization: {
          id: 'org456',
          name: 'Test Org',
          avatar: 'https://example.com/avatar.jpg',
        },
        member: {
          id: 'member789',
          name: 'John Doe',
          avatar: 'https://example.com/john.jpg',
        },
        lastMessage: {
          content: `Message ${i}`,
          senderId: 'member789',
          timestamp: new Date(),
        },
        unreadCount: i,
      }),
    );

    const response: ConversationListResponse = {
      items,
      limit: 20,
      offset: 0,
      hasMore: true,
    };

    expect(response.items).toHaveLength(20);
    expect(response.hasMore).toBe(true);
  });
});
