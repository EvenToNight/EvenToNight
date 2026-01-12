import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

// Schemas
import {
  EventTicketTypeDocument,
  EventTicketTypeSchema,
} from './infrastructure/persistence/schemas/event-ticket-type.schema';
import {
  TicketDocument,
  TicketSchema,
} from './infrastructure/persistence/schemas/ticket.schema';

// Repositories
import { EventTicketTypeRepositoryImpl } from './infrastructure/persistence/repositories/event-ticket-type.repository';
import { EVENT_TICKET_TYPE_REPOSITORY } from './domain/repositories/event-ticket-type.repository.interface';
import { TicketRepositoryImpl } from './infrastructure/persistence/repositories/ticket.repository';
import { TICKET_REPOSITORY } from './domain/repositories/ticket.repository.interface';

// Handlers
import { CreateEventTicketTypeHandler } from './application/handlers/create-event-ticket-type.handler';
import { CreateCheckoutSessionHandler } from './application/handlers/create-checkout-session.handler';

// Events Handlers
import { BaseCheckoutSessionCompletedHandler } from './application/handlers/base-checkout-session-completed.handler';

// Infrastructure
import { TransactionManager } from './infrastructure/database/transaction.manager';

// Controllers
import { EventTicketTypesController } from './presentation/controllers/event-ticket-types.controller';
import { CheckoutSessionsController } from './presentation/controllers/checkout-sessions.controller';
import { MockedCheckoutWebhookController } from './presentation/controllers/mocked-checkout-webhook.controller';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: EventTicketTypeDocument.name, schema: EventTicketTypeSchema },
      { name: TicketDocument.name, schema: TicketSchema },
    ]),
  ],
  controllers: [
    EventTicketTypesController,
    CheckoutSessionsController,
    MockedCheckoutWebhookController,
  ],
  providers: [
    // Repositories
    {
      provide: EVENT_TICKET_TYPE_REPOSITORY,
      useClass: EventTicketTypeRepositoryImpl,
    },
    {
      provide: TICKET_REPOSITORY,
      useClass: TicketRepositoryImpl,
    },

    // Use Case Handlers
    CreateEventTicketTypeHandler,
    CreateCheckoutSessionHandler,

    // Event Handlers
    BaseCheckoutSessionCompletedHandler,

    // Infrastructure
    TransactionManager,
  ],
  exports: [EVENT_TICKET_TYPE_REPOSITORY],
})
export class TicketsModule {}
