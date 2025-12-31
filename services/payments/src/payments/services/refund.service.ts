import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Refund } from '../schemas/refund.schema';
import { Order } from '../schemas/order.schema';
import { TicketService } from '../../tickets/services/ticket.service';
import { StripeService } from './stripe.service';
import { CreateRefundDto } from '../dto/create-refund.dto';
import Stripe from 'stripe';

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    @InjectModel(Refund.name) private refundModel: Model<Refund>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private ticketService: TicketService,
    private stripeService: StripeService,
  ) {}

  /**
   * Process a refund for an order
   */
  async processRefund(dto: CreateRefundDto): Promise<Refund> {
    try {
      // Validate order
      const order = await this.orderModel.findById(dto.orderId).exec();

      if (!order) {
        throw new BadRequestException(`Order ${dto.orderId} not found`);
      }

      if (order.status === 'refunded') {
        throw new BadRequestException('Order already fully refunded');
      }

      if (!order.paymentIntentId) {
        throw new BadRequestException('Order has no payment intent');
      }

      // Calculate refund amount
      const refundAmount = dto.amount || order.totalAmount - order.refundedAmount;

      if (refundAmount <= 0) {
        throw new BadRequestException('Invalid refund amount');
      }

      if (refundAmount > order.totalAmount - order.refundedAmount) {
        throw new BadRequestException('Refund amount exceeds available amount');
      }

      this.logger.log(
        `Processing refund for order ${order.orderNumber}: ${refundAmount} cents`,
      );

      // Create Stripe refund
      const stripeRefund = await this.stripeService.createRefund(
        order.paymentIntentId,
        refundAmount,
        dto.reason as Stripe.RefundCreateParams.Reason,
      );

      // Create refund record
      const refund = new this.refundModel({
        orderId: order._id,
        stripeRefundId: stripeRefund.id,
        amount: refundAmount,
        reason: dto.reason,
        status: stripeRefund.status,
        ticketIds: dto.ticketIds || [],
      });

      await refund.save();

      this.logger.log(
        `Refund created: ${stripeRefund.id} for ${refundAmount} cents`,
      );

      return refund;
    } catch (error) {
      this.logger.error(
        `Failed to process refund for order ${dto.orderId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle successful refund from Stripe webhook
   */
  async handleRefundSuccess(charge: Stripe.Charge): Promise<void> {
    try {
      if (!charge.refunded || !charge.refunds?.data.length) {
        return;
      }

      const refund = charge.refunds.data[0];

      this.logger.log(`Processing refund success: ${refund.id}`);

      // Find refund record
      const refundRecord = await this.refundModel
        .findOne({ stripeRefundId: refund.id })
        .exec();

      if (!refundRecord) {
        this.logger.warn(
          `Refund record not found for Stripe refund ${refund.id}`,
        );
        return;
      }

      // Update refund status
      refundRecord.status = 'succeeded';
      await refundRecord.save();

      // Update order
      const order = await this.orderModel
        .findById(refundRecord.orderId)
        .exec();

      if (order) {
        order.refundedAmount += refundRecord.amount;

        if (order.refundedAmount >= order.totalAmount) {
          order.status = 'refunded';
        } else {
          order.status = 'partially_refunded';
        }

        await order.save();

        this.logger.log(
          `Order ${order.orderNumber} updated: ${order.status}, refunded ${order.refundedAmount}/${order.totalAmount}`,
        );
      }

      // Mark tickets as refunded
      if (refundRecord.ticketIds.length > 0) {
        await this.ticketService.refundTickets(refundRecord.ticketIds);
      } else {
        // Refund all tickets for this order
        const tickets = await this.ticketService.getOrderTickets(
          refundRecord.orderId.toString(),
        );
        const ticketIds = tickets.map((t) => t._id.toString());
        await this.ticketService.refundTickets(ticketIds);
      }

      this.logger.log(`Refund success processed: ${refund.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process refund success: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Process automatic refunds for a cancelled event
   */
  async processEventCancellationRefunds(
    eventId: string,
    reason: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Processing automatic refunds for cancelled event ${eventId}`,
      );

      // Find all completed orders for this event
      const orders = await this.orderModel
        .find({
          eventId,
          status: { $in: ['completed', 'partially_refunded'] },
        })
        .exec();

      this.logger.log(
        `Found ${orders.length} orders to refund for event ${eventId}`,
      );

      for (const order of orders) {
        try {
          const refundAmount = order.totalAmount - order.refundedAmount;

          if (refundAmount > 0) {
            await this.processRefund({
              orderId: order._id.toString(),
              amount: refundAmount,
              reason: `event_cancelled: ${reason}`,
            });
          }
        } catch (error) {
          this.logger.error(
            `Failed to refund order ${order.orderNumber}: ${error.message}`,
          );
          // Continue with other orders
        }
      }

      this.logger.log(
        `Event cancellation refunds processed for event ${eventId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process event cancellation refunds for ${eventId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get refunds for an order
   */
  async getOrderRefunds(orderId: string): Promise<Refund[]> {
    return this.refundModel.find({ orderId }).exec();
  }

  /**
   * Get refund by Stripe refund ID
   */
  async getRefundByStripeId(stripeRefundId: string): Promise<Refund | null> {
    return this.refundModel.findOne({ stripeRefundId }).exec();
  }
}
