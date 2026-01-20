import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';

@Schema({
  collection: 'event_ticket_types',
  timestamps: true,
  versionKey: false,
  _id: false,
})
export class EventTicketTypeDocument extends Document<string> {
  @Prop({ type: String, required: true })
  declare _id: string;

  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({
    required: true,
    enum: [...TicketType.getAllValues()],
  })
  type: string;

  @Prop({ required: false })
  description: string;

  @Prop({
    required: true,
    type: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: 'EUR' },
    },
  })
  price: {
    amount: number;
    currency: string;
  };

  @Prop({ required: true, min: 0 })
  availableQuantity: number;

  @Prop({ required: true, min: 0, default: 0 })
  soldQuantity: number;
}

export const EventTicketTypeSchema = SchemaFactory.createForClass(
  EventTicketTypeDocument,
);

// Compound unique index to prevent duplicate ticket types per event
EventTicketTypeSchema.index({ eventId: 1, type: 1 }, { unique: true });
