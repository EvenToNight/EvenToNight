import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { UpdateEventTicketTypeDto } from '../dto/update-event-ticket-type.dto';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { OutboxService } from '@libs/nestjs-common';
import { TRANSACTION_MANAGER, type TransactionManager } from '@libs/ts-common';
import { TicketTypeUpdatedEvent } from 'src/tickets/domain/events/ticket-type-updated.event';

@Injectable()
export class UpdateTicketTypeHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly outboxService: OutboxService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(
    id: string,
    dto: UpdateEventTicketTypeDto,
  ): Promise<EventTicketType> {
    const ticketType = await this.eventTicketTypeService.findById(id);
    if (!ticketType) {
      throw new NotFoundException(`EventTicketType with id ${id} not found`);
    }
    //TODO: cancel extra tickets and notify users --> refund
    if (dto.quantity && dto.quantity < ticketType.getSoldQuantity()) {
      await this.eventTicketTypeService.updateTicketAndMakeSoldOut(id, dto);
      throw new Error(
        `Cannot reduce quantity below sold tickets: ${ticketType.getSoldQuantity()}`,
      );
    }
    return this.transactionManager.executeInTransaction(async () => {
      const updated = await this.eventTicketTypeService.updateTicket(id, dto);
      await this.outboxService.addEvent(
        new TicketTypeUpdatedEvent({
          ticketTypeId: id,
          price: dto.price,
        }),
        'ticket-type.updated',
      );
      return updated;
    });
  }
}
