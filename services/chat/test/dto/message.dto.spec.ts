import { MessageDTO } from '../../src/conversations/dto/message.dto';

describe('MessageDTO', () => {
  it('should have all required properties', () => {
    const dto: MessageDTO = {
      id: 'msg123',
      conversationId: 'conv456',
      sender: {
        id: 'user789',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      },
      content: 'Hello, this is a test message',
      createdAt: new Date(),
      isRead: true,
    };

    expect(dto.id).toBe('msg123');
    expect(dto.conversationId).toBe('conv456');
    expect(dto.sender.id).toBe('user789');
    expect(dto.sender.name).toBe('John Doe');
    expect(dto.content).toBe('Hello, this is a test message');
    expect(dto.isRead).toBe(true);
  });

  it('should support unread messages', () => {
    const dto: MessageDTO = {
      id: 'msg123',
      conversationId: 'conv456',
      sender: {
        id: 'user789',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      },
      content: 'Unread message',
      createdAt: new Date(),
      isRead: false,
    };

    expect(dto.isRead).toBe(false);
  });

  it('should support long content', () => {
    const longContent = 'a'.repeat(5000);
    const dto: MessageDTO = {
      id: 'msg123',
      conversationId: 'conv456',
      sender: {
        id: 'user789',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      },
      content: longContent,
      createdAt: new Date(),
      isRead: true,
    };

    expect(dto.content.length).toBe(5000);
  });
});
