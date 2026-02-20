import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EventTicketType } from '../../domain/aggregates/event-ticket-type.aggregate';
import { EventId } from '../../domain/value-objects/event-id.vo';
import { Money } from '../../domain/value-objects/money.vo';
import { TicketType } from '../../domain/value-objects/ticket-type.vo';
import { EVENT_TICKET_TYPE_REPOSITORY } from '../../domain/repositories/event-ticket-type.repository.interface';
import { CreateEventTicketTypeDto } from '../dto/create-event-ticket-type.dto';
import { EventService } from '../services/event.service';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { OutboxService } from '@libs/nestjs-common';
import { TRANSACTION_MANAGER, type TransactionManager } from '@libs/ts-common';
import { TicketTypeCreatedEvent } from 'src/tickets/domain/events/ticket-type-created.event';

@Injectable()
export class CreateEventTicketTypeHandler {
  constructor(
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly eventService: EventService,
    private readonly outboxService: OutboxService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(
    eventId: string,
    dto: CreateEventTicketTypeDto,
  ): Promise<EventTicketType> {
    const event = await this.eventService.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with id '${eventId}' not found`);
    }

    const existingTicketTypes =
      await this.eventTicketTypeService.findByEventId(eventId);
    const duplicate = existingTicketTypes.find(
      (tt) => tt.getType().toString() === dto.type,
    );
    if (duplicate) {
      throw new ConflictException(
        `Ticket type '${dto.type}' already exists for event '${eventId}'`,
      );
    }

    const ticketType = EventTicketType.create({
      eventId: EventId.fromString(eventId),
      type: TicketType.fromString(dto.type),
      description: dto.description,
      price: Money.fromAmount(dto.price, 'USD'),
      availableQuantity: dto.quantity,
      soldQuantity: 0,
    });

    return this.transactionManager.executeInTransaction(async () => {
      const saved = await this.eventTicketTypeService.save(ticketType);
      await this.outboxService.addEvent(
        new TicketTypeCreatedEvent({
          eventId: eventId,
          ticketTypeId: ticketType.getId().toString(),
          price: dto.price,
        }),
        'ticket-type.created',
      );
      return saved;
    });
  }
}
