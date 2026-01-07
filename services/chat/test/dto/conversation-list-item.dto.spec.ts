import { ConversationListItemDTO } from '../../src/conversations/dto/conversation-list-item.dto';

describe('ConversationListItemDTO', () => {
  it('should have all required properties', () => {
    const dto: ConversationListItemDTO = {
      id: 'conv123',
      organizationId: 'org456',
      organizationName: 'Test Org',
      organizationAvatar: 'https://example.com/avatar.jpg',
      memberId: 'member789',
      memberName: 'John Doe',
      memberAvatar: 'https://example.com/john.jpg',
      lastMessage: {
        content: 'Hello world',
        senderId: 'member789',
        timestamp: new Date(),
      },
      unreadCount: 5,
    };

    expect(dto.id).toBe('conv123');
    expect(dto.organizationId).toBe('org456');
    expect(dto.organizationName).toBe('Test Org');
    expect(dto.memberId).toBe('member789');
    expect(dto.lastMessage.content).toBe('Hello world');
    expect(dto.unreadCount).toBe(5);
  });

  it('should allow unreadCount to be 0', () => {
    const dto: ConversationListItemDTO = {
      id: 'conv123',
      organizationId: 'org456',
      organizationName: 'Test Org',
      organizationAvatar: 'https://example.com/avatar.jpg',
      memberId: 'member789',
      memberName: 'John Doe',
      memberAvatar: 'https://example.com/john.jpg',
      lastMessage: {
        content: 'Hello world',
        senderId: 'member789',
        timestamp: new Date(),
      },
      unreadCount: 0,
    };

    expect(dto.unreadCount).toBe(0);
  });

  it('should support lastMessage from different senders', () => {
    const dtoFromOrg: ConversationListItemDTO = {
      id: 'conv123',
      organizationId: 'org456',
      organizationName: 'Test Org',
      organizationAvatar: 'https://example.com/avatar.jpg',
      memberId: 'member789',
      memberName: 'John Doe',
      memberAvatar: 'https://example.com/john.jpg',
      lastMessage: {
        content: 'Message from org',
        senderId: 'org456',
        timestamp: new Date(),
      },
      unreadCount: 1,
    };

    const dtoFromMember: ConversationListItemDTO = {
      id: 'conv123',
      organizationId: 'org456',
      organizationName: 'Test Org',
      organizationAvatar: 'https://example.com/avatar.jpg',
      memberId: 'member789',
      memberName: 'John Doe',
      memberAvatar: 'https://example.com/john.jpg',
      lastMessage: {
        content: 'Message from member',
        senderId: 'member789',
        timestamp: new Date(),
      },
      unreadCount: 0,
    };

    expect(dtoFromOrg.lastMessage.senderId).toBe('org456');
    expect(dtoFromMember.lastMessage.senderId).toBe('member789');
  });
});
