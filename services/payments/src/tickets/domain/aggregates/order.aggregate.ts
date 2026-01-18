import { randomUUID } from 'crypto';
import { UserId } from '../value-objects/user-id.vo';
import { OrderStatus } from '../value-objects/order-status.vo';
import { EventId } from '../value-objects/event-id.vo';

//TODO: add reference to session or payment intent id and total amount, evaluate OrderLineItem[]
export interface OrderCreateParams {
  id?: string;
  userId: UserId;
  eventId: EventId;
  ticketIds: string[];
  status: OrderStatus;
  createdAt?: Date;
}

export type StatelessOrderCreateParams = Omit<OrderCreateParams, 'status'>;

export class Order {
  private constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private readonly eventId: EventId,
    private readonly ticketIds: string[],
    private status: OrderStatus,
    private readonly createdAt: Date,
  ) {
    this.validateInvariants();
  }

  static create(params: OrderCreateParams): Order {
    return new Order(
      params.id || this.generateId(),
      params.userId,
      params.eventId,
      params.ticketIds,
      params.status || OrderStatus.COMPLETED,
      params.createdAt || new Date(),
    );
  }

  static createPending(params: StatelessOrderCreateParams): Order {
    return this.create({
      ...params,
      status: OrderStatus.PENDING,
    });
  }

  private static generateId(): string {
    return `order_${randomUUID()}`;
  }

  complete(): void {
    if (!this.canBeCompleted()) {
      throw new Error(
        `Cannot complete order in status: ${this.status.toString()}`,
      );
    }
    this.status = OrderStatus.COMPLETED;
  }

  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error(
        `Cannot cancel order in status: ${this.status.toString()}`,
      );
    }
    this.status = OrderStatus.CANCELLED;
  }

  private canBeCompleted(): boolean {
    return this.status.isPending();
  }

  private canBeCancelled(): boolean {
    return this.status.isPending() || this.status.isCompleted();
  }

  private validateInvariants(): void {
    if (!this.ticketIds || this.ticketIds.length === 0) {
      throw new Error('Order must contain at least one ticket');
    }
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getEventId(): EventId {
    return this.eventId;
  }

  getTicketIds(): string[] {
    return [...this.ticketIds];
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isPending(): boolean {
    return this.status.isPending();
  }

  isCompleted(): boolean {
    return this.status.isCompleted();
  }

  isCancelled(): boolean {
    return this.status.isCancelled();
  }
}
