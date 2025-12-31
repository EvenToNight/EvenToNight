import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class TicketCategory extends Document {
  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true })
  name: string; // "VIP", "Standard", "Early Bird"

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number; // Price in cents (Stripe convention)

  @Prop({ required: true, min: 0 })
  totalCapacity: number; // Maximum tickets for this category

  @Prop({ required: true, default: 0, min: 0 })
  sold: number; // Number of tickets sold

  @Prop({ required: true, default: 0, min: 0 })
  reserved: number; // Number of tickets currently reserved

  @Prop({ default: null })
  saleStartDate?: Date; // When sales begin (for early bird)

  @Prop({ default: null })
  saleEndDate?: Date; // When sales end

  @Prop({ required: true, default: true })
  isActive: boolean; // Can be disabled by organizer

  createdAt: Date;
  updatedAt: Date;
}

export const TicketCategorySchema =
  SchemaFactory.createForClass(TicketCategory);

// Indexes for performance and uniqueness
TicketCategorySchema.index({ eventId: 1, name: 1 }, { unique: true });
TicketCategorySchema.index({ eventId: 1, isActive: 1 });

// Virtual field for available tickets
TicketCategorySchema.virtual('available').get(function (this: TicketCategory) {
  return this.totalCapacity - this.sold - this.reserved;
});

// Ensure virtuals are included when converting to JSON
TicketCategorySchema.set('toJSON', { virtuals: true });
TicketCategorySchema.set('toObject', { virtuals: true });
