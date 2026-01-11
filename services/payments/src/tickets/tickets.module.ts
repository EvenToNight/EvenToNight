import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import {
  EventTicketTypeDocument,
  EventTicketTypeSchema,
} from './infrastructure/persistence/schemas/event-ticket-type.schema';

// Repositories
import { EventTicketTypeRepositoryImpl } from './infrastructure/persistence/repositories/event-ticket-type.repository';
import { EVENT_TICKET_TYPE_REPOSITORY } from './domain/repositories/event-ticket-type.repository.interface';

// Handlers
import { CreateEventTicketTypeHandler } from './application/handlers/create-event-ticket-type.handler';

// Controllers
import { EventTicketTypesController } from './presentation/controllers/event-ticket-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventTicketTypeDocument.name, schema: EventTicketTypeSchema },
    ]),
  ],
  controllers: [EventTicketTypesController],
  providers: [
    // Repositories
    {
      provide: EVENT_TICKET_TYPE_REPOSITORY,
      useClass: EventTicketTypeRepositoryImpl,
    },
    {
      provide: EVENT_TICKET_TYPE_REPOSITORY,
      useClass: EventTicketTypeRepositoryImpl,
    },

    // Use Case Handlers
    CreateEventTicketTypeHandler,
  ],
  exports: [EVENT_TICKET_TYPE_REPOSITORY],
})
export class TicketsModule {}
