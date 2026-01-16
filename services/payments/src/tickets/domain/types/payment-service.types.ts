import { Money } from '../value-objects/money.vo';
export type PaymentStatus = 'open' | 'complete' | 'expired';

export interface CheckoutSession {
  id: string;
  redirectUrl: string | null; // URL to redirect the user to complete the payment, null if session is expired
  expiresAt: number; // Timestamp when the session expires, null if session is complete
  orderId: string;
  status: PaymentStatus;
}

export interface CheckoutLineItem {
  productName: string;
  productDescription?: string;
  price: Money;
  quantity: number;
}

export interface CreateCheckoutSessionParams {
  userId: string;
  orderId: string;
  ticketIds: string[];
  ticketTypeIds: Set<string>[];
  eventId: string;
  lineItems: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
}
