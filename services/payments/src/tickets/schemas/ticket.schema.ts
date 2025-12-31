import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MongooseTypes } from 'mongoose';

export type TicketStatus = 'valid' | 'used' | 'refunded' | 'cancelled';

@Schema({ timestamps: true, versionKey: false })
export class Ticket extends Document {
  @Prop({ required: true, unique: true })
  ticketNumber: string; // e.g., "TKT-EVT123-001"

  @Prop({ required: true, type: MongooseTypes.ObjectId, ref: 'Order', index: true })
  orderId: MongooseTypes.ObjectId;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, type: MongooseTypes.ObjectId, ref: 'TicketCategory' })
  categoryId: MongooseTypes.ObjectId;

  @Prop({ required: true })
  categoryName: string; // Denormalized for easy display

  @Prop({
    required: true,
    enum: ['valid', 'used', 'refunded', 'cancelled'],
    default: 'valid',
  })
  status: TicketStatus;

  @Prop({ default: null })
  qrCode?: string; // Base64 or URL to QR code image

  @Prop({ default: null })
  usedAt?: Date; // When ticket was scanned/used

  createdAt: Date;
  updatedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// Indexes for queries
TicketSchema.index({ userId: 1, eventId: 1 });
TicketSchema.index({ orderId: 1 });
TicketSchema.index({ ticketNumber: 1 }, { unique: true });
TicketSchema.index({ eventId: 1, status: 1 });
