import { PaginatedResult } from '@libs/ts-common/src/pagination/pagination.types';

//TODO: validation only on input DTO?
export type PaginatedResponseDto<T> = PaginatedResult<T>;
