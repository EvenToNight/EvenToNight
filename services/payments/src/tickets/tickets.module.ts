import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import {
  EventTicketTypeDocument,
  EventTicketTypeSchema,
} from './infrastructure/persistence/schemas/event-ticket-type.schema';
import {
  TicketDocument,
  TicketSchema,
} from './infrastructure/persistence/schemas/ticket.schema';
import {
  OrderDocument,
  OrderSchema,
} from './infrastructure/persistence/schemas/order.schema';
import {
  UserDocument,
  UserSchema,
} from './infrastructure/persistence/schemas/user.schema';
import {
  EventDocument,
  EventSchema,
} from './infrastructure/persistence/schemas/event.schema';

// Repositories
import { EventTicketTypeRepositoryImpl } from './infrastructure/persistence/repositories/event-ticket-type.repository';
import { EVENT_TICKET_TYPE_REPOSITORY } from './domain/repositories/event-ticket-type.repository.interface';
import { TicketRepositoryImpl } from './infrastructure/persistence/repositories/ticket.repository';
import { TICKET_REPOSITORY } from './domain/repositories/ticket.repository.interface';
import { OrderRepositoryImpl } from './infrastructure/persistence/repositories/order.repository';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository.interface';
import { UserRepositoryImpl } from './infrastructure/persistence/repositories/user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { EventRepositoryImpl } from './infrastructure/persistence/repositories/event.repository';
import { EVENT_REPOSITORY } from './domain/repositories/event.repository.interface';

// Domain Services
import { StripeService } from './infrastructure/payment/stripe.service';
import { PAYMENT_SERVICE } from './domain/services/payment.service.interface';

// Handlers
import { CreateEventTicketTypeHandler } from './application/handlers/create-event-ticket-type.handler';
import { CreateCheckoutSessionHandler } from './application/handlers/create-checkout-session.handler';
import { DeleteEventTicketTypesHandler } from './application/handlers/delete-event-ticket-types.handler';
import { DeleteTicketTypeHandler } from './application/handlers/delete-ticket-type.handler';
import { StripeWebhookHandler } from './application/handlers/stripe-webhook.handler';
import { CheckoutSessionCompletedHandler } from './application/handlers/checkout-session-completed.handler';
import { CheckoutSessionExpiredHandler } from './application/handlers/checkout-session-expired.handler';
import { UpdateTicketTypeHandler } from './application/handlers/update-ticket-type.handler';
import { InvalidateTicketStatusHandler } from './application/handlers/invalidate-ticket-status.handler';

// Infrastructure
import { TransactionManager } from './infrastructure/database/transaction.manager';

// Controllers
import { EventTicketTypesController } from './presentation/controllers/event-ticket-types.controller';
import { CheckoutSessionsController } from './presentation/controllers/checkout-sessions.controller';
import { MockedStripeWebhookController } from './presentation/controllers/mocked-stripe-webhook.controller';
import { StripeWebhookController } from './presentation/controllers/stripe-webhook.controller';
import { TicketsController } from './presentation/controllers/tickets.controller';
import { OrderController } from './presentation/controllers/order-controller';
import { EventController } from './presentation/controllers/events.controller';
import { UserController } from './presentation/controllers/users.controller';

// Consumers
import { UserEventConsumer } from './presentation/consumers/user-event.consumer';

// Services
import { PdfService } from './application/services/pdf.service';
import { EventTicketTypeService } from './application/services/event-ticket-type.service';
import { TicketService } from './application/services/ticket.service';
import { OrderService } from './application/services/order.service';
import { EventService } from './application/services/event.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventTicketTypeDocument.name, schema: EventTicketTypeSchema },
      { name: TicketDocument.name, schema: TicketSchema },
      { name: OrderDocument.name, schema: OrderSchema },
      { name: UserDocument.name, schema: UserSchema },
      { name: EventDocument.name, schema: EventSchema },
    ]),
  ],
  controllers: [
    EventTicketTypesController,
    CheckoutSessionsController,
    MockedStripeWebhookController,
    StripeWebhookController,
    TicketsController,
    OrderController,
    EventController,
    UserEventConsumer,
    UserController,
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
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: EVENT_REPOSITORY,
      useClass: EventRepositoryImpl,
    },

    // Domain Services
    {
      provide: PAYMENT_SERVICE,
      useClass: StripeService,
    },

    // Use Case Handlers
    CreateEventTicketTypeHandler,
    CreateCheckoutSessionHandler,
    DeleteEventTicketTypesHandler,
    DeleteTicketTypeHandler,
    StripeWebhookHandler,
    CheckoutSessionCompletedHandler,
    CheckoutSessionExpiredHandler,
    UpdateTicketTypeHandler,
    InvalidateTicketStatusHandler,

    // Infrastructure
    TransactionManager,

    // Services
    PdfService,
    EventTicketTypeService,
    TicketService,
    OrderService,
    EventService,
  ],
  exports: [EVENT_TICKET_TYPE_REPOSITORY, ORDER_REPOSITORY, USER_REPOSITORY],
})
export class TicketsModule {}
