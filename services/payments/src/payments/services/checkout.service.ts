import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrderService } from './order.service';
import { ReservationService } from '../../inventory/services/reservation.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { TicketService } from '../../tickets/services/ticket.service';
import { TicketPublisher } from '../../tickets/controllers/ticket.publisher';
import type {
  CreateCheckoutDto,
  CreateCheckoutResponseDto,
} from '../dto/create-checkout.dto';
import Stripe from 'stripe';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private stripeService: StripeService,
    private orderService: OrderService,
    private reservationService: ReservationService,
    private inventoryService: InventoryService,
    private ticketService: TicketService,
    private ticketPublisher: TicketPublisher,
  ) {}

  /**
   * Create checkout session: reservation + payment intent
   */
  async createCheckout(
    dto: CreateCheckoutDto,
  ): Promise<CreateCheckoutResponseDto> {
    try {
      this.logger.log(
        `Creating checkout for user ${dto.userId}, event ${dto.eventId}`,
      );

      // Step 1: Calculate total amount
      let totalAmount = 0;
      for (const item of dto.items) {
        const category = await this.inventoryService.getCategoryById(
          item.categoryId,
        );
        totalAmount += category.price * item.quantity;
      }

      this.logger.log(`Total amount calculated: ${totalAmount} cents`);

      // Step 2: Create reservation (atomic inventory lock)
      const reservation = await this.reservationService.createReservation({
        userId: dto.userId,
        eventId: dto.eventId,
        items: dto.items,
      });

      this.logger.log(`Reservation created: ${reservation._id}`);

      // Step 3: Create Stripe Payment Intent
      const paymentIntent = await this.stripeService.createPaymentIntent(
        totalAmount,
        'usd',
        {
          reservationId: reservation._id.toString(),
          userId: dto.userId,
          eventId: dto.eventId,
        },
      );

      this.logger.log(`Payment Intent created: ${paymentIntent.id}`);

      return {
        reservationId: reservation._id.toString(),
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        totalAmount,
        expiresAt: reservation.expiresAt,
      };
    } catch (error) {
      this.logger.error(
        `Checkout creation failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle successful payment (called by webhook)
   */
  async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      const reservationId = paymentIntent.metadata.reservationId;

      if (!reservationId) {
        this.logger.error(
          `PaymentIntent ${paymentIntent.id} missing reservationId in metadata`,
        );
        return;
      }

      this.logger.log(
        `Processing payment success for PaymentIntent ${paymentIntent.id}`,
      );

      // Check if order already exists (idempotency)
      const existingOrder = await this.orderService.findByPaymentIntentId(
        paymentIntent.id,
      );

      if (existingOrder) {
        this.logger.warn(
          `Order already exists for PaymentIntent ${paymentIntent.id}, skipping`,
        );
        return;
      }

      // Confirm reservation (reserved → sold)
      await this.reservationService.confirmReservation(reservationId);

      // Get reservation details
      const reservation =
        await this.reservationService.getReservation(reservationId);

      // Create order
      const order = await this.orderService.createOrderFromReservation(
        reservation,
        paymentIntent.id,
      );

      // Link reservation to order
      await this.reservationService.linkToOrder(
        reservationId,
        order._id.toString(),
      );

      // Create payment record
      await this.orderService.createPayment(
        order._id.toString(),
        paymentIntent.id,
        paymentIntent.amount,
        paymentIntent.currency,
        'succeeded',
      );

      // Generate tickets with QR codes
      const tickets = await this.ticketService.generateTicketsForOrder(order);

      // Publish ticket.purchased event
      await this.ticketPublisher.publishTicketPurchased(order, tickets);

      this.logger.log(
        `Payment success processed: Order ${order.orderNumber} created with ${tickets.length} tickets`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process payment success for ${paymentIntent.id}: ${error.message}`,
        error.stack,
      );
      // Don't throw - webhook should return 200 even if processing fails
      // Failed payments can be retried or handled manually
    }
  }

  /**
   * Handle failed payment (called by webhook)
   */
  async handlePaymentFailure(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      const reservationId = paymentIntent.metadata.reservationId;

      if (!reservationId) {
        this.logger.error(
          `PaymentIntent ${paymentIntent.id} missing reservationId in metadata`,
        );
        return;
      }

      this.logger.log(
        `Processing payment failure for PaymentIntent ${paymentIntent.id}`,
      );

      // Cancel reservation (release reserved tickets)
      await this.reservationService.cancelReservation(reservationId);

      this.logger.log(
        `Payment failure processed: Reservation ${reservationId} cancelled`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process payment failure for ${paymentIntent.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Create checkout session with hosted Stripe page
   */
  async createCheckoutSession(dto: CreateCheckoutDto): Promise<{ sessionUrl: string; reservationId: string }> {
    try {
      this.logger.log(
        `Creating checkout session for user ${dto.userId}, event ${dto.eventId}`,
      );

      // Step 1: Calculate total amount
      let totalAmount = 0;
      for (const item of dto.items) {
        const category = await this.inventoryService.getCategoryById(
          item.categoryId,
        );
        totalAmount += category.price * item.quantity;
      }

      this.logger.log(`Total amount calculated: ${totalAmount} cents`);

      // Step 2: Create reservation (atomic inventory lock)
      const reservation = await this.reservationService.createReservation({
        userId: dto.userId,
        eventId: dto.eventId,
        items: dto.items,
      });

      this.logger.log(`Reservation created: ${reservation._id}`);

      // Step 3: Create Stripe Checkout Session
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const session = await this.stripeService.createCheckoutSession(
        totalAmount,
        'usd',
        {
          reservationId: reservation._id.toString(),
          userId: dto.userId,
          eventId: dto.eventId,
        },
        `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/payment-cancelled?reservation_id=${reservation._id}`,
      );

      this.logger.log(`Checkout Session created: ${session.id}`);

      return {
        sessionUrl: session.url!,
        reservationId: reservation._id.toString(),
      };
    } catch (error) {
      this.logger.error(
        `Checkout session creation failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Cancel checkout (user abandons)
   */
  async cancelCheckout(reservationId: string): Promise<void> {
    await this.reservationService.cancelReservation(reservationId);
    this.logger.log(`Checkout cancelled for reservation ${reservationId}`);
  }
}
