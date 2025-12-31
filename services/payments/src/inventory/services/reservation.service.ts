import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types as MongooseTypes } from 'mongoose';
import { TicketCategory } from '../schemas/ticket-category.schema';
import { Reservation } from '../schemas/reservation.schema';
import { InventoryExhaustedException } from '../../common/exceptions/inventory-exhausted.exception';
import { ReservationExpiredException } from '../../common/exceptions/reservation-expired.exception';
import { ReserveTicketsDto } from '../dto/reserve-tickets.dto';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    @InjectModel(TicketCategory.name)
    private categoryModel: Model<TicketCategory>,
    @InjectModel(Reservation.name)
    private reservationModel: Model<Reservation>,
  ) {}

  /**
   * Create a reservation with atomic inventory updates
   * This is the CRITICAL method that prevents overselling
   * Note: Transactions require MongoDB replica set. Set USE_TRANSACTIONS=false for local dev without replica set
   */
  async createReservation(dto: ReserveTicketsDto): Promise<Reservation> {
    const useTransactions = process.env.USE_TRANSACTIONS !== 'false';

    if (!useTransactions) {
      this.logger.warn('Running without transactions - not recommended for production!');
      return this.createReservationWithoutTransaction(dto);
    }

    const session: ClientSession =
      await this.categoryModel.db.startSession();
    session.startTransaction();

    try {
      // Step 1: Validate and atomically reserve tickets for each category
      const reservationItems: Array<{ categoryId: MongooseTypes.ObjectId; quantity: number }> = [];

      for (const item of dto.items) {
        this.logger.log(
          `Attempting to reserve ${item.quantity} tickets for category ${item.categoryId}`,
        );

        // CRITICAL: Atomic update with availability check
        const category = await this.categoryModel.findOneAndUpdate(
          {
            _id: item.categoryId,
            eventId: dto.eventId,
            isActive: true,
            // Ensure enough available tickets
            $expr: {
              $gte: [
                {
                  $subtract: [
                    '$totalCapacity',
                    { $add: ['$sold', '$reserved'] },
                  ],
                },
                item.quantity,
              ],
            },
          },
          {
            $inc: { reserved: item.quantity }, // Atomically increment reserved count
          },
          { session, new: true },
        );

        if (!category) {
          throw new InventoryExhaustedException(
            `Not enough tickets available for category ${item.categoryId}`,
          );
        }

        this.logger.log(
          `Successfully reserved ${item.quantity} tickets. Category now has ${category.reserved} reserved`,
        );

        reservationItems.push({
          categoryId: new MongooseTypes.ObjectId(item.categoryId),
          quantity: item.quantity,
        });
      }

      // Step 2: Create reservation record
      const ttlMinutes = parseInt(
        process.env.RESERVATION_TTL_MINUTES || '10',
        10,
      );
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      const reservation = new this.reservationModel({
        userId: dto.userId,
        eventId: dto.eventId,
        items: reservationItems,
        status: 'pending',
        expiresAt,
      });

      await reservation.save({ session });

      await session.commitTransaction();

      this.logger.log(
        `Reservation ${reservation._id} created successfully, expires at ${expiresAt}`,
      );

      return reservation;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Failed to create reservation: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Development-only: Create reservation without transactions
   * WARNING: This can lead to race conditions and overselling. Only use for local testing!
   */
  private async createReservationWithoutTransaction(dto: ReserveTicketsDto): Promise<Reservation> {
    const reservationItems: Array<{ categoryId: MongooseTypes.ObjectId; quantity: number }> = [];

    for (const item of dto.items) {
      this.logger.log(
        `Attempting to reserve ${item.quantity} tickets for category ${item.categoryId}`,
      );

      // Atomic update with availability check (still atomic even without transaction)
      const category = await this.categoryModel.findOneAndUpdate(
        {
          _id: item.categoryId,
          eventId: dto.eventId,
          isActive: true,
          $expr: {
            $gte: [
              {
                $subtract: [
                  '$totalCapacity',
                  { $add: ['$sold', '$reserved'] },
                ],
              },
              item.quantity,
            ],
          },
        },
        {
          $inc: { reserved: item.quantity },
        },
        { new: true },
      );

      if (!category) {
        throw new InventoryExhaustedException(
          `Not enough tickets available for category ${item.categoryId}`,
        );
      }

      this.logger.log(
        `Successfully reserved ${item.quantity} tickets. Category now has ${category.reserved} reserved`,
      );

      reservationItems.push({
        categoryId: new MongooseTypes.ObjectId(item.categoryId),
        quantity: item.quantity,
      });
    }

    const ttlMinutes = parseInt(
      process.env.RESERVATION_TTL_MINUTES || '10',
      10,
    );
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const reservation = new this.reservationModel({
      userId: dto.userId,
      eventId: dto.eventId,
      items: reservationItems,
      status: 'pending',
      expiresAt,
    });

    await reservation.save();

    this.logger.log(
      `Reservation ${reservation._id} created successfully, expires at ${expiresAt}`,
    );

    return reservation;
  }

  /**
   * Confirm a reservation by converting reserved → sold
   * Called after successful payment
   */
  async confirmReservation(reservationId: string): Promise<void> {
    const useTransactions = process.env.USE_TRANSACTIONS !== 'false';

    if (!useTransactions) {
      return this.confirmReservationWithoutTransaction(reservationId);
    }

    const session: ClientSession =
      await this.reservationModel.db.startSession();
    session.startTransaction();

    try {
      const reservation = await this.reservationModel
        .findById(reservationId)
        .session(session);

      if (!reservation) {
        throw new BadRequestException('Reservation not found');
      }

      if (reservation.status !== 'pending') {
        throw new BadRequestException(
          `Reservation is ${reservation.status}, cannot confirm`,
        );
      }

      // Check expiry
      if (new Date() > reservation.expiresAt) {
        throw new ReservationExpiredException('Reservation has expired');
      }

      // Convert reserved → sold for each category
      for (const item of reservation.items) {
        await this.categoryModel.findByIdAndUpdate(
          item.categoryId,
          {
            $inc: {
              reserved: -item.quantity, // Decrease reserved
              sold: item.quantity, // Increase sold
            },
          },
          { session },
        );

        this.logger.log(
          `Confirmed ${item.quantity} tickets for category ${item.categoryId}`,
        );
      }

      reservation.status = 'confirmed';
      await reservation.save({ session });

      await session.commitTransaction();

      this.logger.log(`Reservation ${reservationId} confirmed successfully`);
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Failed to confirm reservation ${reservationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async confirmReservationWithoutTransaction(reservationId: string): Promise<void> {
    const reservation = await this.reservationModel.findById(reservationId);

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    if (reservation.status !== 'pending') {
      throw new BadRequestException(
        `Reservation is ${reservation.status}, cannot confirm`,
      );
    }

    if (new Date() > reservation.expiresAt) {
      throw new ReservationExpiredException('Reservation has expired');
    }

    for (const item of reservation.items) {
      await this.categoryModel.findByIdAndUpdate(
        item.categoryId,
        {
          $inc: {
            reserved: -item.quantity,
            sold: item.quantity,
          },
        },
      );

      this.logger.log(
        `Confirmed ${item.quantity} tickets for category ${item.categoryId}`,
      );
    }

    reservation.status = 'confirmed';
    await reservation.save();

    this.logger.log(`Reservation ${reservationId} confirmed successfully`);
  }

  /**
   * Cancel a reservation by releasing reserved tickets
   * Called when payment fails or user abandons checkout
   */
  async cancelReservation(reservationId: string): Promise<void> {
    const useTransactions = process.env.USE_TRANSACTIONS !== 'false';

    if (!useTransactions) {
      return this.cancelReservationWithoutTransaction(reservationId);
    }

    const session: ClientSession =
      await this.reservationModel.db.startSession();
    session.startTransaction();

    try {
      const reservation = await this.reservationModel
        .findById(reservationId)
        .session(session);

      if (!reservation) {
        this.logger.warn(`Reservation ${reservationId} not found`);
        return; // Already deleted or doesn't exist
      }

      if (reservation.status !== 'pending') {
        this.logger.warn(
          `Reservation ${reservationId} is ${reservation.status}, skipping cancellation`,
        );
        return; // Already processed
      }

      // Release reserved tickets
      for (const item of reservation.items) {
        await this.categoryModel.findByIdAndUpdate(
          item.categoryId,
          { $inc: { reserved: -item.quantity } },
          { session },
        );

        this.logger.log(
          `Released ${item.quantity} reserved tickets for category ${item.categoryId}`,
        );
      }

      reservation.status = 'cancelled';
      await reservation.save({ session });

      await session.commitTransaction();

      this.logger.log(`Reservation ${reservationId} cancelled successfully`);
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Failed to cancel reservation ${reservationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async cancelReservationWithoutTransaction(reservationId: string): Promise<void> {
    const reservation = await this.reservationModel.findById(reservationId);

    if (!reservation) {
      this.logger.warn(`Reservation ${reservationId} not found`);
      return;
    }

    if (reservation.status !== 'pending') {
      this.logger.warn(
        `Reservation ${reservationId} is ${reservation.status}, skipping cancellation`,
      );
      return;
    }

    for (const item of reservation.items) {
      await this.categoryModel.findByIdAndUpdate(
        item.categoryId,
        { $inc: { reserved: -item.quantity } },
      );

      this.logger.log(
        `Released ${item.quantity} reserved tickets for category ${item.categoryId}`,
      );
    }

    reservation.status = 'cancelled';
    await reservation.save();

    this.logger.log(`Reservation ${reservationId} cancelled successfully`);
  }

  /**
   * Get a reservation by ID
   */
  async getReservation(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(reservationId)
      .exec();

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    return reservation;
  }

  /**
   * Find expired reservations that need cleanup
   */
  async findExpiredReservations(): Promise<Reservation[]> {
    return this.reservationModel
      .find({
        status: 'pending',
        expiresAt: { $lt: new Date() },
      })
      .exec();
  }

  /**
   * Link reservation to an order
   */
  async linkToOrder(reservationId: string, orderId: string): Promise<void> {
    await this.reservationModel.findByIdAndUpdate(reservationId, {
      orderId,
    });
  }
}
