import { Injectable, NotFoundException } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { UpdateEventTicketTypeDto } from '../dto/update-event-ticket-type.dto';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';

@Injectable()
export class UpdateTicketTypeHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
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
    return await this.eventTicketTypeService.updateTicket(id, dto);
  }
}
