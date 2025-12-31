import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { Payment } from '../schemas/payment.schema';
import { Reservation } from '../../inventory/schemas/reservation.schema';
import { TicketCategory } from '../../inventory/schemas/ticket-category.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(TicketCategory.name)
    private categoryModel: Model<TicketCategory>,
  ) {}

  /**
   * Create an order from a confirmed reservation
   */
  async createOrderFromReservation(
    reservation: Reservation,
    paymentIntentId: string,
  ): Promise<Order> {
    try {
      // Fetch category details for pricing
      const items = await Promise.all(
        reservation.items.map(async (item) => {
          const category = await this.categoryModel
            .findById(item.categoryId)
            .exec();

          if (!category) {
            throw new Error(`Category ${item.categoryId} not found`);
          }

          return {
            categoryId: item.categoryId,
            categoryName: category.name,
            quantity: item.quantity,
            pricePerTicket: category.price,
            subtotal: category.price * item.quantity,
          };
        }),
      );

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      // Generate unique order number
      const orderNumber = this.generateOrderNumber();

      const order = new this.orderModel({
        orderNumber,
        userId: reservation.userId,
        eventId: reservation.eventId,
        items,
        totalAmount,
        status: 'completed',
        currency: 'usd',
        paymentIntentId,
        refundedAmount: 0,
      });

      await order.save();

      this.logger.log(
        `Order ${orderNumber} created for user ${reservation.userId}, total: ${totalAmount}`,
      );

      return order;
    } catch (error) {
      this.logger.error(
        `Failed to create order from reservation ${reservation._id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a payment record
   */
  async createPayment(
    orderId: string,
    paymentIntentId: string,
    amount: number,
    currency: string,
    status: string,
  ): Promise<Payment> {
    const payment = new this.paymentModel({
      orderId,
      paymentIntentId,
      amount,
      currency,
      status,
      metadata: {},
    });

    await payment.save();

    this.logger.log(
      `Payment record created for order ${orderId}, PaymentIntent: ${paymentIntentId}`,
    );

    return payment;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
  ): Promise<Order | null> {
    return this.orderModel
      .findByIdAndUpdate(orderId, { status }, { new: true })
      .exec();
  }

  /**
   * Find order by payment intent ID
   */
  async findByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<Order | null> {
    return this.orderModel.findOne({ paymentIntentId }).exec();
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get event orders
   */
  async getEventOrders(eventId: string): Promise<Order[]> {
    return this.orderModel
      .find({ eventId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = uuidv4().split('-')[0].toUpperCase();
    return `ORD-${dateStr}-${randomPart}`;
  }
}
