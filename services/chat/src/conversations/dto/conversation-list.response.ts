import { PaginatedResponse } from '../../common/paginated-response.dto';
import { ConversationListItemDTO } from './conversation-list-item.dto';

export interface ConversationListResponse extends PaginatedResponse<ConversationListItemDTO> {}
