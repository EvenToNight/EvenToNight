import { PaginatedResult } from '@libs/ts-common';
//TODO: validation only on input DTO?
export type PaginatedResponseDto<T> = PaginatedResult<T>;
