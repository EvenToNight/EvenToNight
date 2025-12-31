import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MongooseTypes } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export class OrderItem {
  @Prop({ required: true, type: MongooseTypes.ObjectId })
  categoryId: MongooseTypes.ObjectId;

  @Prop({ required: true })
  categoryName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  pricePerTicket: number; // Price at time of purchase (historical record)

  @Prop({ required: true, min: 0 })
  subtotal: number;
}

@Schema({ timestamps: true, versionKey: false })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string; // e.g., "ORD-20250101-ABC123"

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, type: [OrderItem] })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  totalAmount: number; // In cents

  @Prop({
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  })
  status: OrderStatus;

  @Prop({ required: true, default: 'usd' })
  currency: string; // 'usd', 'eur', etc.

  @Prop({ default: null })
  paymentIntentId?: string; // Stripe Payment Intent ID

  @Prop({ default: 0, min: 0 })
  refundedAmount: number; // For partial refunds

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ eventId: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ paymentIntentId: 1 });
