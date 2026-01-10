import { PaginatedResponse } from '../../common/paginated-response.dto';
import { ConversationListItemDTO } from './conversation-list-item.dto';

export type ConversationListResponse =
  PaginatedResponse<ConversationListItemDTO>;
