import { PaginatedResponse } from '../../common/paginated-response.dto';
import { MessageDTO } from './message.dto';

export interface MessageListResponse extends PaginatedResponse<MessageDTO> {}
