import { Inject, Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { UpdateEventTicketTypeDto } from '../dto/update-event-ticket-type.dto';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { OutboxService } from '@libs/nestjs-common';
import {
  TRANSACTION_MANAGER,
  Transactional,
  type TransactionManager,
} from '@libs/ts-common';
import { TicketTypeUpdatedEvent } from 'src/tickets/domain/events/ticket-type-updated.event';
import { EventTicketTypeNotFoundException } from 'src/tickets/domain/exceptions/event-ticket-type-not-found.exception';

@Injectable()
export class UpdateTicketTypeHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly outboxService: OutboxService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  @Transactional()
  async handle(
    id: string,
    dto: UpdateEventTicketTypeDto,
  ): Promise<EventTicketType> {
    const ticketType = await this.eventTicketTypeService.findById(id);
    if (!ticketType) {
      throw new EventTicketTypeNotFoundException(id);
    }
    //TODO: cancel extra tickets and notify users --> refund
    if (dto.quantity && dto.quantity < ticketType.getSoldQuantity()) {
      return this.eventTicketTypeService.updateTicketAndMakeSoldOut(id, dto);
    }
    const updated = await this.eventTicketTypeService.updateTicket(id, dto);
    await this.outboxService.addEvent(
      new TicketTypeUpdatedEvent({
        ticketTypeId: id,
        price: dto.price,
      }),
      'ticket-type.updated',
    );
    return updated;
  }
}
