/**
 * Event envelope format matching the Events service convention
 */
export interface EventEnvelope<T = any> {
  eventType: string;
  occurredAt: string;
  payload: T;
}

/**
 * Event payloads from Events service
 */
export interface TicketCategoryData {
  name: string;
  description: string;
  price: number; // In cents
  totalCapacity: number;
  saleStartDate?: string | null;
  saleEndDate?: string | null;
}

export interface TicketsCreatedPayload {
  eventId: string;
  categories: TicketCategoryData[];
}

export interface TicketsUpdatedPayload {
  eventId: string;
  categories: TicketCategoryData[];
}

export interface EventCancelledPayload {
  eventId: string;
  reason: string;
}

/**
 * Event payloads to publish from Payments service
 */
export interface TicketPurchasedPayload {
  orderId: string;
  userId: string;
  eventId: string;
  tickets: {
    ticketId: string;
    categoryName: string;
    ticketNumber: string;
  }[];
  totalAmount: number;
}

export interface TicketRefundedPayload {
  orderId: string;
  userId: string;
  eventId: string;
  ticketIds: string[];
  refundAmount: number;
}

export interface TicketUsedPayload {
  ticketId: string;
  ticketNumber: string;
  eventId: string;
  userId: string;
  usedAt: string;
}
