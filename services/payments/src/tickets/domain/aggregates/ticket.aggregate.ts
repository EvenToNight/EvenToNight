import { randomUUID } from 'crypto';
import { EventId } from '../value-objects/event-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Money } from '../value-objects/money.vo';
import { TicketStatus } from '../value-objects/ticket-status.vo';
import { InvalidTicketStatusException } from '../exceptions/invalid-ticket-status.exception';

export interface TicketCreateParams {
  id?: string;
  eventId: EventId;
  userId: UserId;
  attendeeName: string;
  ticketTypeId: string;
  price: Money;
  purchaseDate?: Date;
  status?: TicketStatus;
}

export class Ticket {
  private constructor(
    private readonly id: string,
    private readonly eventId: EventId,
    private readonly userId: UserId,
    private attendeeName: string,
    private readonly ticketTypeId: string,
    private readonly price: Money,
    private readonly purchaseDate: Date,
    private status: TicketStatus,
  ) {
    this.validateInvariants();
  }

  static create(params: TicketCreateParams): Ticket {
    return new Ticket(
      params.id || this.generateId(),
      params.eventId,
      params.userId,
      params.attendeeName,
      params.ticketTypeId,
      params.price,
      params.purchaseDate || new Date(),
      params.status || TicketStatus.ACTIVE,
    );
  }

  /**
   * Create a ticket in PENDING_PAYMENT status.
   * Used in Saga pattern - Phase 1: Reserve inventory before payment
   */
  static createPending(params: TicketCreateParams): Ticket {
    return new Ticket(
      params.id || this.generateId(),
      params.eventId,
      params.userId,
      params.attendeeName,
      params.ticketTypeId,
      params.price,
      params.purchaseDate || new Date(),
      TicketStatus.PENDING_PAYMENT,
    );
  }

  private static generateId(): string {
    return `ticket_${randomUUID()}`;
  }

  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new InvalidTicketStatusException(this.status.toString(), 'cancel');
    }
    this.status = TicketStatus.CANCELLED;
  }

  refund(): void {
    if (!this.canBeRefunded()) {
      throw new InvalidTicketStatusException(this.status.toString(), 'refund');
    }
    this.status = TicketStatus.REFUNDED;
  }

  /**
   * Confirm payment and activate ticket.
   * Used in Saga pattern - Phase 2: Confirm after successful payment
   */
  confirmPayment(): void {
    if (!this.status.isPendingPayment()) {
      throw new InvalidTicketStatusException(
        this.status.toString(),
        'confirm payment',
      );
    }
    this.status = TicketStatus.ACTIVE;
  }

  /**
   * Mark payment as failed.
   * Used in Saga pattern - Compensation: Payment failed, mark ticket
   */
  markPaymentFailed(): void {
    if (!this.status.isPendingPayment()) {
      throw new InvalidTicketStatusException(
        this.status.toString(),
        'mark payment as failed',
      );
    }
    this.status = TicketStatus.PAYMENT_FAILED;
  }

  //TODO: evaluate ownership transefer
  transferTo(newAttendeeName: string): void {
    if (!this.canBeTransferred()) {
      throw new InvalidTicketStatusException(
        this.status.toString(),
        'transfer',
      );
    }
    if (!newAttendeeName || newAttendeeName.trim().length === 0) {
      throw new Error('Attendee name cannot be empty');
    }
    this.attendeeName = newAttendeeName;
  }

  private canBeCancelled(): boolean {
    return this.status.isActive();
  }

  private canBeRefunded(): boolean {
    return this.status.isActive();
  }

  private canBeTransferred(): boolean {
    return this.status.isActive();
  }

  private validateInvariants(): void {
    if (!this.attendeeName || this.attendeeName.trim().length === 0) {
      throw new Error('Attendee name cannot be empty');
    }
    if (!this.ticketTypeId || this.ticketTypeId.trim().length === 0) {
      throw new Error('Ticket type ID cannot be empty');
    }
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEventId(): EventId {
    return this.eventId;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getAttendeeName(): string {
    return this.attendeeName;
  }

  getTicketTypeId(): string {
    return this.ticketTypeId;
  }

  getPrice(): Money {
    return this.price;
  }

  getPurchaseDate(): Date {
    return this.purchaseDate;
  }

  getStatus(): TicketStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status.isActive();
  }

  isPendingPayment(): boolean {
    return this.status.isPendingPayment();
  }

  isCancelled(): boolean {
    return this.status.isCancelled();
  }

  isRefunded(): boolean {
    return this.status.isRefunded();
  }

  isPaymentFailed(): boolean {
    return this.status.isPaymentFailed();
  }
}
