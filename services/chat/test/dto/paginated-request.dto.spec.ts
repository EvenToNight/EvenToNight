import { PaginatedRequest } from '../../src/common/paginated-request.dto';

describe('PaginatedRequest', () => {
  it('should define limit and offset as optional properties', () => {
    const request: PaginatedRequest = {};
    expect(request.limit).toBeUndefined();
    expect(request.offset).toBeUndefined();
  });

  it('should allow setting limit', () => {
    const request: PaginatedRequest = { limit: 10 };
    expect(request.limit).toBe(10);
  });

  it('should allow setting offset', () => {
    const request: PaginatedRequest = { offset: 20 };
    expect(request.offset).toBe(20);
  });

  it('should allow setting both limit and offset', () => {
    const request: PaginatedRequest = { limit: 10, offset: 20 };
    expect(request.limit).toBe(10);
    expect(request.offset).toBe(20);
  });
});
