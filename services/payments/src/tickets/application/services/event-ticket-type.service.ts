import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { EventTicketTypeRepository } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import { EVENT_TICKET_TYPE_REPOSITORY } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import type { ClientSession } from 'mongoose';

@Injectable()
export class EventTicketTypeService {
  constructor(
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly eventTicketTypeRepository: EventTicketTypeRepository,
  ) {}

  findTicketTypeByIdWithLock(
    ticketTypeId: string,
    session: ClientSession,
  ): Promise<EventTicketType | null> {
    return this.eventTicketTypeRepository.findByIdWithLock(
      ticketTypeId,
      session,
    );
  }

  update(ticketType: EventTicketType): Promise<EventTicketType> {
    return this.eventTicketTypeRepository.update(ticketType);
  }
}
