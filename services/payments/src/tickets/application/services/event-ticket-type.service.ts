import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { EventTicketTypeRepository } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import { EVENT_TICKET_TYPE_REPOSITORY } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import type { ClientSession } from 'mongoose';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';

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

  findById(id: string): Promise<EventTicketType | null> {
    return this.eventTicketTypeRepository.findById(id);
  }

  findByEventId(eventId: string): Promise<EventTicketType[]> {
    return this.eventTicketTypeRepository.findByEventId(eventId);
  }

  delete(id: string): Promise<void> {
    return this.eventTicketTypeRepository.delete(id);
  }

  async deleteEventTicketTypes(eventId: string): Promise<string[]> {
    const eventTicketTypesIds = (
      await this.eventTicketTypeRepository.findByEventId(eventId)
    ).map((t) => t.getId());
    await Promise.all(
      eventTicketTypesIds.map((ttId) =>
        this.eventTicketTypeRepository.delete(ttId),
      ),
    );
    return eventTicketTypesIds;
  }

  getAllTicketTypeValues(): string[] {
    return TicketType.getAllValues();
  }
}
