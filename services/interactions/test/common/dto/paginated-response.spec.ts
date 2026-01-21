import { PaginatedResponseDto } from '../../../src/commons/dto/paginated-response.dto';

describe('PaginatedResponseDto', () => {
  it('calculates hasMore true when offset + items.length < total', () => {
    const items = [1, 2, 3];
    const total = 10;
    const limit = 3;
    const offset = 0;
    const dto = new PaginatedResponseDto(items, total, limit, offset);

    expect(dto.items).toEqual(items);
    expect(dto.totalItems).toBe(total);
    expect(dto.limit).toBe(limit);
    expect(dto.offset).toBe(offset);
    expect(dto.hasMore).toBe(true);
  });

  it('calculates hasMore false when offset + items.length >= total', () => {
    const items = [1, 2, 3];
    const total = 3;
    const limit = 3;
    const offset = 0;
    const dto = new PaginatedResponseDto(items, total, limit, offset);

    expect(dto.hasMore).toBe(false);
  });

  it('works when offset equals non-zero and items empty', () => {
    const items: number[] = [];
    const total = 2;
    const limit = 10;
    const offset = 2;
    const dto = new PaginatedResponseDto(items, total, limit, offset);

    expect(dto.hasMore).toBe(false);
  });
});
