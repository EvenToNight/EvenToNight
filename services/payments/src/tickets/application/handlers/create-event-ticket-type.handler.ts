import { Injectable, Inject } from '@nestjs/common';
import { EventTicketType } from '../../domain/aggregates/event-ticket-type.aggregate';
import { EventId } from '../../domain/value-objects/event-id.vo';
import { Money } from '../../domain/value-objects/money.vo';
import { TicketType } from '../../domain/value-objects/ticket-type.vo';
import { EVENT_TICKET_TYPE_REPOSITORY } from '../../domain/repositories/event-ticket-type.repository.interface';
import { CreateEventTicketTypeDto } from '../dto/create-event-ticket-type.dto';
import { EventService } from '../services/event.service';
import { Event } from '../../domain/aggregates/event.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventTicketTypeService } from '../services/event-ticket-type.service';

@Injectable()
export class CreateEventTicketTypeHandler {
  constructor(
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly eventService: EventService,
  ) {}

  async handle(
    eventId: string,
    dto: CreateEventTicketTypeDto,
  ): Promise<EventTicketType> {
    const ticketType = EventTicketType.create({
      eventId: EventId.fromString(eventId),
      type: TicketType.fromString(dto.type),
      description: dto.description,
      price: Money.fromAmount(dto.price, dto.currency || 'EUR'),
      availableQuantity: dto.quantity,
      soldQuantity: 0,
    });
    //TODO: get creatorId by forwarding token from event service???
    const event = Event.create(
      EventId.fromString(eventId),
      UserId.fromString(dto.creatorId),
    );
    await this.eventService.save(event);
    return this.eventTicketTypeService.save(ticketType);
  }
}
