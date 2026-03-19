import 'reflect-metadata';
import { ConversationListItemDTO } from '../../src/conversations/dto/conversation-list-item.dto';
import { DataMapperService } from '../../src/conversations/services/data-mapper.service';
import { UserSuggestionService } from '../../src/conversations/services/user-suggestion.service';
import { UserRole } from '../../src/users/schemas/user.schema';
import { UsersService } from '../../src/users/services/users.service';

describe('UserSuggestionService', () => {
  let dataMapperService: {
    buildSuggestions: jest.Mock;
  };
  let usersService: {
    getUserInfo: jest.Mock;
    searchUsers: jest.Mock;
  };
  let service: UserSuggestionService;

  beforeEach(() => {
    dataMapperService = {
      buildSuggestions: jest.fn(),
    };

    usersService = {
      getUserInfo: jest.fn(),
      searchUsers: jest.fn(),
    };

    service = new UserSuggestionService(
      dataMapperService as unknown as DataMapperService,
      usersService as unknown as UsersService,
    );
  });

  it('returns empty response when current user does not exist', async () => {
    usersService.getUserInfo.mockResolvedValue(null);

    const result = await service.getSuggestedUsers('u-1', {
      limit: 2,
      offset: 5,
    });

    expect(result).toEqual({
      items: [],
      limit: 2,
      offset: 5,
      hasMore: false,
    });
    expect(usersService.searchUsers).not.toHaveBeenCalled();
    expect(dataMapperService.buildSuggestions).not.toHaveBeenCalled();
  });

  it('builds target query with name and recipientId filters', async () => {
    usersService.searchUsers.mockResolvedValue([]);

    await service.searchTargetUsers('me', UserRole.ORGANIZATION, {
      name: 'john',
      recipientId: 'abc',
    });

    expect(usersService.searchUsers).toHaveBeenCalledWith({
      userId: { $ne: 'me', $regex: '^abc', $options: 'i' },
      role: UserRole.ORGANIZATION,
      name: { $regex: 'john', $options: 'i' },
    });
  });

  it('paginates suggestions and sets hasMore when limit is exceeded', async () => {
    usersService.getUserInfo.mockResolvedValue({
      id: 'me',
      role: UserRole.MEMBER,
      name: 'Me',
    });
    usersService.searchUsers.mockResolvedValue([
      { id: 'org-1', role: UserRole.ORGANIZATION },
      { id: 'org-2', role: UserRole.ORGANIZATION },
      { id: 'org-3', role: UserRole.ORGANIZATION },
    ]);
    dataMapperService.buildSuggestions.mockResolvedValue([
      { id: 's-1' },
      { id: 's-2' },
    ]);

    const result = await service.getSuggestedUsers('me', {
      limit: 2,
      offset: 0,
    });

    expect(dataMapperService.buildSuggestions).toHaveBeenCalledWith(
      [
        { id: 'org-1', role: UserRole.ORGANIZATION },
        { id: 'org-2', role: UserRole.ORGANIZATION },
      ],
      'me',
    );
    expect(result).toEqual({
      items: [{ id: 's-1' }, { id: 's-2' }],
      limit: 2,
      offset: 0,
      hasMore: true,
    });
  });

  it('does not add suggestions when conversation list is already full', async () => {
    const conversations: ConversationListItemDTO[] = [
      {
        id: 'c1',
        organization: { id: 'org-1', name: 'Org 1', avatar: 'o1.jpg' },
        member: { id: 'me', name: 'Me', avatar: 'me.jpg' },
        lastMessage: null,
        unreadCount: 0,
      },
      {
        id: 'c2',
        organization: { id: 'org-2', name: 'Org 2', avatar: 'o2.jpg' },
        member: { id: 'me', name: 'Me', avatar: 'me.jpg' },
        lastMessage: null,
        unreadCount: 0,
      },
    ];

    await service.addSuggestionsIfNeeded(conversations, 'me', 2, 'n', 'r');

    expect(usersService.getUserInfo).not.toHaveBeenCalled();
    expect(conversations).toHaveLength(2);
  });

  it('adds only non-duplicate suggestions up to remaining slots', async () => {
    const conversations: ConversationListItemDTO[] = [
      {
        id: 'c1',
        organization: { id: 'me' },
        member: { id: 'partner-1' },
        lastMessage: null,
        unreadCount: 0,
      },
    ] as ConversationListItemDTO[];

    usersService.getUserInfo.mockResolvedValue({
      id: 'me',
      role: UserRole.MEMBER,
    });
    usersService.searchUsers.mockResolvedValue([
      { id: 'partner-1', role: UserRole.ORGANIZATION },
      { id: 'partner-2', role: UserRole.ORGANIZATION },
      { id: 'partner-3', role: UserRole.ORGANIZATION },
    ]);
    dataMapperService.buildSuggestions.mockResolvedValue([
      {
        organization: { id: 'partner-1' },
        member: { id: 'me' },
      },
      {
        organization: { id: 'partner-2' },
        member: { id: 'me' },
      },
      {
        organization: { id: 'partner-3' },
        member: { id: 'me' },
      },
    ]);

    await service.addSuggestionsIfNeeded(conversations, 'me', 3);

    expect(conversations).toHaveLength(3);
    expect(conversations[1].organization.id).toBe('partner-2');
    expect(conversations[2].organization.id).toBe('partner-3');
  });
});
