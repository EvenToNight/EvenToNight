import { randomUUID } from 'crypto';
import { EventId } from '../value-objects/event-id.vo';
import { EventTicketTypeId } from '../value-objects/event-ticket-type-id.vo';
import { Money } from '../value-objects/money.vo';
import { TicketType } from '../value-objects/ticket-type.vo';
import { InsufficientTotalQuantityException } from '../exceptions/insufficient-total-quantity.exception';
import { NegativeAvailableQuantityException } from '../exceptions/negative-available-quantity.exception';
import { NegativeSoldQuantityException } from '../exceptions/negative-sold-quantity.exception';
import { SoldOutException } from '../exceptions/sold-out.exception';

export interface EventTicketTypeCreateParams {
  id?: EventTicketTypeId;
  eventId: EventId;
  type: TicketType;
  description?: string;
  price: Money;
  availableQuantity: number;
  soldQuantity?: number;
}

export class EventTicketType {
  private constructor(
    private readonly id: EventTicketTypeId,
    private readonly eventId: EventId,
    private readonly type: TicketType,
    private price: Money,
    private availableQuantity: number,
    private soldQuantity: number,
    private description?: string,
  ) {
    this.validateInvariants();
  }

  static create(params: EventTicketTypeCreateParams): EventTicketType {
    return new EventTicketType(
      params.id || EventTicketTypeId.fromString(this.generateId()),
      params.eventId,
      params.type,
      params.price,
      params.availableQuantity,
      params.soldQuantity || 0,
      params.description,
    );
  }

  private static generateId(): string {
    return `ett_${randomUUID()}`;
  }

  reserveTicket(): void {
    if (this.isSoldOut()) {
      throw new SoldOutException(this.type.toString());
    }

    this.soldQuantity += 1;
    this.availableQuantity -= 1;
    this.validateInvariants();
  }

  releaseTicket(): void {
    this.soldQuantity -= 1;
    this.availableQuantity += 1;
    this.validateInvariants();
  }

  isSoldOut(): boolean {
    return this.availableQuantity <= 0;
  }

  private validateInvariants(): void {
    if (this.soldQuantity < 0) {
      throw new NegativeSoldQuantityException();
    }
    if (this.availableQuantity < 0) {
      throw new NegativeAvailableQuantityException();
    }
  }

  getId(): EventTicketTypeId {
    return this.id;
  }

  getEventId(): EventId {
    return this.eventId;
  }

  getType(): TicketType {
    return this.type;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getPrice(): Money {
    return this.price;
  }

  getAvailableQuantity(): number {
    return this.availableQuantity;
  }

  getSoldQuantity(): number {
    return this.soldQuantity;
  }

  getTotalQuantity(): number {
    return this.availableQuantity + this.soldQuantity;
  }

  setDescription(description?: string): void {
    this.description = description;
  }

  setPrice(price: Money): void {
    this.price = price;
  }

  setTotalQuantity(quantity: number): void {
    if (quantity < this.soldQuantity) {
      throw new InsufficientTotalQuantityException();
    }
    this.availableQuantity = quantity - this.soldQuantity;
  }
}
