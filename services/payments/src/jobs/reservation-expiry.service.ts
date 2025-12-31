import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationService } from '../inventory/services/reservation.service';

@Injectable()
export class ReservationExpiryService {
  private readonly logger = new Logger(ReservationExpiryService.name);

  constructor(private reservationService: ReservationService) {}

  /**
   * Run every 2 minutes to clean up expired reservations
   * Releases reserved tickets back to available pool
   */
  @Cron('*/2 * * * *') // Every 2 minutes
  async handleExpiredReservations() {
    try {
      const expiredReservations =
        await this.reservationService.findExpiredReservations();

      if (expiredReservations.length === 0) {
        return;
      }

      this.logger.log(
        `Found ${expiredReservations.length} expired reservations to process`,
      );

      for (const reservation of expiredReservations) {
        try {
          await this.reservationService.cancelReservation(
            reservation._id.toString(),
          );
        } catch (error) {
          this.logger.error(
            `Failed to cancel expired reservation ${reservation._id}: ${error.message}`,
          );
          // Continue with next reservation
        }
      }

      this.logger.log(
        `Processed ${expiredReservations.length} expired reservations`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing expired reservations: ${error.message}`,
        error.stack,
      );
    }
  }
}
