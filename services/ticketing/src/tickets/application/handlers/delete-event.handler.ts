import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_MANAGER, type TransactionManager } from '@libs/ts-common';
import { DeleteEventTicketTypesHandler } from './delete-event-ticket-types.handler';
import { EventService } from '../services/event.service';

/**
 * Atomically deletes an event together with all its ticket types and tickets.
 * Use this when the event itself must also be removed (e.g. on event.deleted
 * from the events service). For deleting only ticket types while keeping
 * the event, use DeleteEventTicketTypesHandler instead.
 */
@Injectable()
export class DeleteEventHandler {
  constructor(
    private readonly deleteTicketTypesHandler: DeleteEventTicketTypesHandler,
    private readonly eventService: EventService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(eventId: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async () => {
      await this.deleteTicketTypesHandler.handle(eventId);
      await this.eventService.delete(eventId);
    });
  }
}
