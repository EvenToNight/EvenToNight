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
import {
  OrderDocument,
  OrderSchema,
} from './infrastructure/persistence/schemas/order.schema';
import {
  UserDocument,
  UserSchema,
} from './infrastructure/persistence/schemas/user.scherma';

// Repositories
import { EventTicketTypeRepositoryImpl } from './infrastructure/persistence/repositories/event-ticket-type.repository';
import { EVENT_TICKET_TYPE_REPOSITORY } from './domain/repositories/event-ticket-type.repository.interface';
import { TicketRepositoryImpl } from './infrastructure/persistence/repositories/ticket.repository';
import { TICKET_REPOSITORY } from './domain/repositories/ticket.repository.interface';
import { OrderRepositoryImpl } from './infrastructure/persistence/repositories/order.repository';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository.interface';
import { UserRepositoryImpl } from './infrastructure/persistence/repositories/user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

// Domain Services
import { PAYMENT_SERVICE } from './domain/services/payment.service.interface';
import { StripeService } from './infrastructure/payment/stripe.service';

// Handlers
import { CreateEventTicketTypeHandler } from './application/handlers/create-event-ticket-type.handler';
import { CreateCheckoutSessionHandler } from './application/handlers/create-checkout-session.handler';
import { DeleteEventTicketTypesHandler } from './application/handlers/delete-event-ticket-types.handler';
import { DeleteTicketTypeHandler } from './application/handlers/delete-ticket-type.handler';

// Events Handlers
import { BaseCheckoutSessionCompletedHandler } from './application/handlers/base-checkout-session-completed.handler';
import { CheckoutSessionCompletedHandler } from './application/handlers/checkout-session-completed.handler';
import { CheckoutSessionExpiredHandler } from './application/handlers/checkout-session-expired.handler';

// Infrastructure
import { TransactionManager } from './infrastructure/database/transaction.manager';

// Controllers
import { EventTicketTypesController } from './presentation/controllers/event-ticket-types.controller';
import { CheckoutSessionsController } from './presentation/controllers/checkout-sessions.controller';
import { MockedCheckoutWebhookController } from './presentation/controllers/mocked-checkout-webhook.controller';
import { TicketsController } from './presentation/controllers/tickets.controller';
import { OrderController } from './presentation/controllers/order-controller';

// Services
import { PdfService } from './application/services/pdf.service';
import { EventTicketTypeService } from './application/services/event-ticket-type.service';
import { TicketService } from './application/services/ticket.service';
import { OrderService } from './application/services/order.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: EventTicketTypeDocument.name, schema: EventTicketTypeSchema },
      { name: TicketDocument.name, schema: TicketSchema },
      { name: OrderDocument.name, schema: OrderSchema },
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    EventTicketTypesController,
    CheckoutSessionsController,
    MockedCheckoutWebhookController,
    TicketsController,
    OrderController,
  ],
  providers: [
    // PaymentService provider
    {
      provide: PAYMENT_SERVICE,
      useClass: StripeService,
    },
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

    // Use Case Handlers
    CreateEventTicketTypeHandler,
    CreateCheckoutSessionHandler,
    DeleteEventTicketTypesHandler,
    DeleteTicketTypeHandler,

    // Event Handlers
    BaseCheckoutSessionCompletedHandler,
    CheckoutSessionCompletedHandler,
    CheckoutSessionExpiredHandler,

    // Infrastructure
    TransactionManager,

    // Services
    PdfService,
    EventTicketTypeService,
    TicketService,
    OrderService,
  ],
  exports: [EVENT_TICKET_TYPE_REPOSITORY, ORDER_REPOSITORY, USER_REPOSITORY],
})
export class TicketsModule {}
