import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TicketCategory,
  TicketCategorySchema,
} from './schemas/ticket-category.schema';
import {
  Reservation,
  ReservationSchema,
} from './schemas/reservation.schema';
import { InventoryService } from './services/inventory.service';
import { ReservationService } from './services/reservation.service';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryConsumer } from './controllers/inventory.consumer';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TicketCategory.name, schema: TicketCategorySchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, ReservationService, InventoryConsumer],
  exports: [InventoryService, ReservationService],
})
export class InventoryModule {}
