import { PaginatedResponse } from './paginated-response.dto';

export interface PaginatedResponseWithTotalCount<
  T,
> extends PaginatedResponse<T> {
  totalItems: number;
}
