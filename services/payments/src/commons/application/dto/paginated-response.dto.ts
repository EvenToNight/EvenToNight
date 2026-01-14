import { PaginatedResult } from 'src/tickets/domain/types/pagination.types';

//TODO: validation only on input DTO?
export type PaginatedResponseDto<T> = PaginatedResult<T>;
