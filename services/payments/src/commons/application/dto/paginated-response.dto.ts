import { PaginatedResult } from 'src/commons/domain/types/pagination.types';

//TODO: validation only on input DTO?
export type PaginatedResponseDto<T> = PaginatedResult<T>;
