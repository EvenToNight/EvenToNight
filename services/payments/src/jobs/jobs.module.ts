import { Module } from '@nestjs/common';
import { ReservationExpiryService } from './reservation-expiry.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  providers: [ReservationExpiryService],
})
export class JobsModule {}
