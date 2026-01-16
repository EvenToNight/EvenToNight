import { PaginatedResponseWithTotalCount } from '../../src/common/paginated-response-with-total.dto';

describe('PaginatedResponseWithTotalCount', () => {
  it('should extend PaginatedResponse with totalItems', () => {
    const response: PaginatedResponseWithTotalCount<string> = {
      items: ['item1', 'item2'],
      limit: 10,
      offset: 0,
      hasMore: false,
      totalItems: 2,
    };

    expect(response.items).toEqual(['item1', 'item2']);
    expect(response.limit).toBe(10);
    expect(response.offset).toBe(0);
    expect(response.hasMore).toBe(false);
    expect(response.totalItems).toBe(2);
  });

  it('should work with totalItems greater than items length', () => {
    const response: PaginatedResponseWithTotalCount<number> = {
      items: [1, 2, 3],
      limit: 3,
      offset: 0,
      hasMore: true,
      totalItems: 100,
    };

    expect(response.items.length).toBe(3);
    expect(response.totalItems).toBe(100);
    expect(response.hasMore).toBe(true);
  });
});
