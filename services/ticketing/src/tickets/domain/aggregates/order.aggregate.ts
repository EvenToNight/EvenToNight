import { randomUUID } from 'crypto';
import { UserId } from '../value-objects/user-id.vo';
import { OrderId } from '../value-objects/order-id.vo';
import { OrderStatus } from '../value-objects/order-status.vo';
import { EventId } from '../value-objects/event-id.vo';
import { TicketId } from '../value-objects/ticket-id.vo';
import { EmptyOrderTicketsException } from '../exceptions/empty-order-tickets.exception';
import { InvalidOrderStatusTransitionException } from '../exceptions/invalid-order-status-transition.exception';

export interface OrderCreateParams {
  id?: OrderId;
  userId: UserId;
  eventId: EventId;
  ticketIds: TicketId[];
  status: OrderStatus;
  paymentIntentId?: string;
  createdAt?: Date;
}

export type StatelessOrderCreateParams = Omit<OrderCreateParams, 'status'>;

export class Order {
  private constructor(
    private readonly id: OrderId,
    private readonly userId: UserId,
    private readonly eventId: EventId,
    private readonly ticketIds: TicketId[],
    private status: OrderStatus,
    private readonly createdAt: Date,
    private paymentIntentId?: string,
  ) {
    this.validateInvariants();
  }

  static create(params: OrderCreateParams): Order {
    return new Order(
      params.id || OrderId.fromString(this.generateId()),
      params.userId,
      params.eventId,
      params.ticketIds,
      params.status,
      params.createdAt || new Date(),
      params.paymentIntentId,
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
      throw new InvalidOrderStatusTransitionException(
        this.status.toString(),
        'complete',
      );
    }
    this.status = OrderStatus.COMPLETED;
  }

  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new InvalidOrderStatusTransitionException(
        this.status.toString(),
        'cancel',
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
      throw new EmptyOrderTicketsException();
    }
  }

  getId(): OrderId {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getEventId(): EventId {
    return this.eventId;
  }

  getTicketIds(): TicketId[] {
    return [...this.ticketIds];
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getPaymentIntentId(): string | undefined {
    return this.paymentIntentId;
  }

  setPaymentIntentId(paymentIntentId: string): void {
    this.paymentIntentId = paymentIntentId;
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
