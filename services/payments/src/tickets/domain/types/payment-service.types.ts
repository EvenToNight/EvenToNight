import { Money } from '../value-objects/money.vo';
export interface CheckoutLineItem {
  productName: string;
  productDescription?: string;
  price: Money;
  quantity: number;
}

export interface CreateCheckoutSessionParams {
  userId: string;
  lineItems: CheckoutLineItem[];
  metadata?: Record<string, any>;
  successUrl: string;
  cancelUrl: string;
}
