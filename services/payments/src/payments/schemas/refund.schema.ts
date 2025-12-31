import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MongooseTypes } from 'mongoose';

export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

@Schema({ timestamps: true, versionKey: false })
export class Refund extends Document {
  @Prop({ required: true, type: MongooseTypes.ObjectId, ref: 'Order', index: true })
  orderId: MongooseTypes.ObjectId;

  @Prop({ required: true, unique: true })
  stripeRefundId: string;

  @Prop({ required: true, min: 0 })
  amount: number; // Amount refunded in cents

  @Prop({ required: true })
  reason: string; // 'event_cancelled', 'user_request', 'duplicate'

  @Prop({
    required: true,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending',
  })
  status: RefundStatus;

  @Prop({ type: [String], default: [] })
  ticketIds: string[]; // Tickets that were refunded

  @Prop({ default: null })
  failureReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);

// Indexes
RefundSchema.index({ orderId: 1 });
RefundSchema.index({ stripeRefundId: 1 }, { unique: true });
RefundSchema.index({ status: 1, createdAt: -1 });
