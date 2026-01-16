import { MessageListResponse } from '../../src/conversations/dto/message-list.response';
import { MessageDTO } from '../../src/conversations/dto/message.dto';

describe('MessageListResponse', () => {
  it('should conform to PaginatedResponse structure', () => {
    const message: MessageDTO = {
      id: 'msg123',
      conversationId: 'conv456',
      sender: {
        id: 'user789',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      },
      content: 'Test message',
      createdAt: new Date(),
      isRead: true,
    };

    const response: MessageListResponse = {
      items: [message],
      limit: 50,
      offset: 0,
      hasMore: false,
    };

    expect(response.items).toHaveLength(1);
    expect(response.items[0].id).toBe('msg123');
    expect(response.limit).toBe(50);
    expect(response.offset).toBe(0);
    expect(response.hasMore).toBe(false);
  });

  it('should support empty messages list', () => {
    const response: MessageListResponse = {
      items: [],
      limit: 50,
      offset: 0,
      hasMore: false,
    };

    expect(response.items).toEqual([]);
    expect(response.items.length).toBe(0);
  });

  it('should support pagination with hasMore', () => {
    const messages: MessageDTO[] = Array.from({ length: 50 }, (_, i) => ({
      id: `msg${i}`,
      conversationId: 'conv456',
      sender: {
        id: 'user789',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      },
      content: `Message ${i}`,
      createdAt: new Date(Date.now() - i * 1000),
      isRead: i < 25,
    }));

    const response: MessageListResponse = {
      items: messages,
      limit: 50,
      offset: 0,
      hasMore: true,
    };

    expect(response.items).toHaveLength(50);
    expect(response.hasMore).toBe(true);
  });
});
