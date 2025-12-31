import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MongooseTypes } from 'mongoose';

export type ReservationStatus = 'pending' | 'confirmed' | 'expired' | 'cancelled';

export class ReservationItem {
  @Prop({ required: true, type: MongooseTypes.ObjectId, ref: 'TicketCategory' })
  categoryId: MongooseTypes.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

@Schema({ timestamps: true, versionKey: false })
export class Reservation extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, type: [ReservationItem] })
  items: ReservationItem[];

  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'expired', 'cancelled'],
    default: 'pending',
  })
  status: ReservationStatus;

  @Prop({ required: true, index: true })
  expiresAt: Date; // TTL for automatic expiry (10 minutes from creation)

  @Prop({ default: null })
  orderId?: string; // Link to Order when confirmed

  createdAt: Date;
  updatedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Indexes for queries and TTL
ReservationSchema.index({ userId: 1, status: 1 });
ReservationSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0, // MongoDB TTL index for automatic deletion
  },
);

// Compound index for finding active reservations by event and category
ReservationSchema.index({
  eventId: 1,
  status: 1,
  expiresAt: 1,
});
