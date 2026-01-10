import { PaginatedResponse } from '../../src/common/paginated-response.dto';

describe('PaginatedResponse', () => {
  it('should have all required properties', () => {
    const response: PaginatedResponse<string> = {
      items: ['item1', 'item2'],
      limit: 10,
      offset: 0,
      hasMore: false,
    };

    expect(response.items).toEqual(['item1', 'item2']);
    expect(response.limit).toBe(10);
    expect(response.offset).toBe(0);
    expect(response.hasMore).toBe(false);
  });

  it('should work with empty items array', () => {
    const response: PaginatedResponse<string> = {
      items: [],
      limit: 10,
      offset: 0,
      hasMore: false,
    };

    expect(response.items).toEqual([]);
    expect(response.items.length).toBe(0);
  });

  it('should support generic types', () => {
    interface TestItem {
      id: string;
      name: string;
    }

    const response: PaginatedResponse<TestItem> = {
      items: [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
      ],
      limit: 10,
      offset: 0,
      hasMore: true,
    };

    expect(response.items).toHaveLength(2);
    expect(response.items[0].id).toBe('1');
    expect(response.items[0].name).toBe('Test 1');
    expect(response.hasMore).toBe(true);
  });

  it('should indicate hasMore correctly', () => {
    const responseWithMore: PaginatedResponse<number> = {
      items: [1, 2, 3],
      limit: 3,
      offset: 0,
      hasMore: true,
    };

    const responseWithoutMore: PaginatedResponse<number> = {
      items: [1, 2],
      limit: 3,
      offset: 0,
      hasMore: false,
    };

    expect(responseWithMore.hasMore).toBe(true);
    expect(responseWithoutMore.hasMore).toBe(false);
  });
});
