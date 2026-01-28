import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';

@Schema({
  collection: 'tickets',
  timestamps: true,
  versionKey: false,
  _id: false,
})
export class TicketDocument {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  attendeeName: string;

  @Prop({ required: true })
  ticketTypeId: string;

  @Prop({
    required: true,
    type: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: 'USD' },
    },
  })
  price: {
    amount: number;
    currency: string;
  };

  @Prop({ required: true })
  purchaseDate: Date;

  @Prop({
    required: true,
    enum: [...TicketStatus.getAllValues()],
    default: 'ACTIVE',
    index: true,
  })
  status: string;
}

export type TicketDocumentType = HydratedDocument<TicketDocument>;

export const TicketSchema = SchemaFactory.createForClass(TicketDocument);

// TODO: evaluate indexes based on query patterns
// Composite indexes for common queries, A composite index performs best when both indexed fields are used in the query.
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ eventId: 1, status: 1 });
TicketSchema.index({ purchaseDate: -1 });
