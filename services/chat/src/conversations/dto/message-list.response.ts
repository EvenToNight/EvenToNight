import { PaginatedResponse } from '../../common/paginated-response.dto';
import { MessageDTO } from './message.dto';

export type MessageListResponse = PaginatedResponse<MessageDTO>;
