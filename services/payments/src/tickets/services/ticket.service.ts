import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../schemas/ticket.schema';
import { Order } from '../../payments/schemas/order.schema';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
  ) {}

  /**
   * Generate tickets for an order
   */
  async generateTicketsForOrder(order: Order): Promise<Ticket[]> {
    try {
      const tickets: Ticket[] = [];

      for (const item of order.items) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketNumber = this.generateTicketNumber(
            order.eventId,
            tickets.length + 1,
          );

          // Generate QR code
          const qrCode = await this.generateQRCode(ticketNumber);

          const ticket = new this.ticketModel({
            ticketNumber,
            orderId: order._id,
            userId: order.userId,
            eventId: order.eventId,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            status: 'valid',
            qrCode,
          });

          await ticket.save();
          tickets.push(ticket);

          this.logger.log(
            `Generated ticket ${ticketNumber} for order ${order.orderNumber}`,
          );
        }
      }

      return tickets;
    } catch (error) {
      this.logger.error(
        `Failed to generate tickets for order ${order._id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(
    userId: string,
    eventId?: string,
  ): Promise<Ticket[]> {
    const query: any = { userId };

    if (eventId) {
      query.eventId = eventId;
    }

    return this.ticketModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get ticket by ticket number
   */
  async getTicketByNumber(ticketNumber: string): Promise<Ticket> {
    const ticket = await this.ticketModel
      .findOne({ ticketNumber })
      .exec();

    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketNumber} not found`);
    }

    return ticket;
  }

  /**
   * Mark ticket as used (check-in)
   */
  async useTicket(ticketNumber: string, scannedBy?: string): Promise<Ticket> {
    const ticket = await this.getTicketByNumber(ticketNumber);

    if (ticket.status !== 'valid') {
      throw new Error(`Ticket ${ticketNumber} is ${ticket.status}, cannot use`);
    }

    ticket.status = 'used';
    ticket.usedAt = new Date();

    await ticket.save();

    this.logger.log(
      `Ticket ${ticketNumber} marked as used${scannedBy ? ` by ${scannedBy}` : ''}`,
    );

    return ticket;
  }

  /**
   * Mark tickets as refunded
   */
  async refundTickets(ticketIds: string[]): Promise<void> {
    await this.ticketModel.updateMany(
      { _id: { $in: ticketIds } },
      { status: 'refunded' },
    );

    this.logger.log(`Refunded ${ticketIds.length} tickets`);
  }

  /**
   * Get tickets for an event
   */
  async getEventTickets(eventId: string): Promise<Ticket[]> {
    return this.ticketModel
      .find({ eventId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get tickets for an order
   */
  async getOrderTickets(orderId: string): Promise<Ticket[]> {
    return this.ticketModel
      .find({ orderId })
      .exec();
  }

  /**
   * Generate unique ticket number
   */
  private generateTicketNumber(eventId: string, sequenceNum: number): string {
    const eventPrefix = eventId.substring(0, 6).toUpperCase();
    const seqStr = sequenceNum.toString().padStart(4, '0');
    const randomPart = uuidv4().split('-')[0].substring(0, 4).toUpperCase();
    return `TKT-${eventPrefix}-${seqStr}-${randomPart}`;
  }

  /**
   * Generate QR code for ticket
   */
  private async generateQRCode(ticketNumber: string): Promise<string> {
    try {
      // Generate QR code as data URL (base64)
      const qrCodeDataUrl = await QRCode.toDataURL(ticketNumber, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
      });

      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate QR code for ${ticketNumber}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
