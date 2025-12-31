import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MongooseTypes } from 'mongoose';

export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'canceled';

@Schema({ timestamps: true, versionKey: false })
export class Payment extends Document {
  @Prop({ required: true, type: MongooseTypes.ObjectId, ref: 'Order', index: true })
  orderId: MongooseTypes.ObjectId;

  @Prop({ required: true, unique: true })
  paymentIntentId: string; // Stripe Payment Intent ID

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({
    required: true,
    enum: [
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'succeeded',
      'canceled',
    ],
  })
  status: PaymentStatus; // Mirrors Stripe Payment Intent status

  @Prop({ default: null })
  stripeChargeId?: string; // Charge ID when payment succeeds

  @Prop({ default: null })
  failureReason?: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Additional Stripe metadata

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ paymentIntentId: 1 }, { unique: true });
PaymentSchema.index({ status: 1, createdAt: -1 });
