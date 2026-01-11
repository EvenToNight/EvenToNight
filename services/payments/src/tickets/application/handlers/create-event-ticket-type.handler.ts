import { Injectable, Inject } from '@nestjs/common';
import { EventTicketType } from '../../domain/aggregates/event-ticket-type.aggregate';
import { EventId } from '../../domain/value-objects/event-id.vo';
import { Money } from '../../domain/value-objects/money.vo';
import { TicketType } from '../../domain/value-objects/ticket-type.vo';
import type { EventTicketTypeRepository } from '../../domain/repositories/event-ticket-type.repository.interface';
import { EVENT_TICKET_TYPE_REPOSITORY } from '../../domain/repositories/event-ticket-type.repository.interface';
import { CreateEventTicketTypeDto } from '../dto/create-event-ticket-type.dto';

@Injectable()
export class CreateEventTicketTypeHandler {
  constructor(
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly repository: EventTicketTypeRepository,
  ) {}

  async handle(dto: CreateEventTicketTypeDto): Promise<EventTicketType> {
    const ticketType = EventTicketType.create({
      eventId: EventId.fromString(dto.eventId),
      type: TicketType.fromString(dto.type),
      description: dto.description,
      price: Money.fromAmount(dto.price, dto.currency || 'EUR'),
      availableQuantity: dto.quantity,
      soldQuantity: 0,
    });

    return this.repository.save(ticketType);
  }
}
