import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Refund, RefundSchema } from './schemas/refund.schema';
import { StripeService } from './services/stripe.service';
import { OrderService } from './services/order.service';
import { CheckoutService } from './services/checkout.service';
import { RefundService } from './services/refund.service';
import { CheckoutController } from './controllers/checkout.controller';
import { WebhookController } from './controllers/webhook.controller';
import { RefundController } from './controllers/refund.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { TicketsModule } from '../tickets/tickets.module';
import {
  TicketCategory,
  TicketCategorySchema,
} from '../inventory/schemas/ticket-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Refund.name, schema: RefundSchema },
      { name: TicketCategory.name, schema: TicketCategorySchema },
    ]),
    forwardRef(() => InventoryModule),
    TicketsModule,
  ],
  controllers: [CheckoutController, WebhookController, RefundController],
  providers: [
    StripeService,
    OrderService,
    CheckoutService,
    RefundService,
  ],
  exports: [StripeService, OrderService, CheckoutService, RefundService],
})
export class PaymentsModule {}
