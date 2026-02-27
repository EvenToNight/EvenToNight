import { DomainNotFoundException } from './domain-not-found.exception';

export class OrderNotFoundException extends DomainNotFoundException {
  constructor(orderId?: string) {
    super(orderId ? `Order with id ${orderId} not found` : 'Order not found');
  }
}
