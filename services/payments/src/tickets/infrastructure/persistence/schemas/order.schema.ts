import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderStatus } from 'src/tickets/domain/value-objects/order-status.vo';

@Schema({
  collection: 'orders',
  timestamps: true,
  versionKey: false,
  _id: false,
})
export class OrderDocument {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ type: [String], required: true })
  ticketIds: string[];

  @Prop({
    required: true,
    enum: [...OrderStatus.getAllValues()],
    index: true,
  })
  status: string;

  @Prop({ required: true })
  createdAt: Date;
}

export type OrderDocumentType = HydratedDocument<OrderDocument>;

export const OrderSchema = SchemaFactory.createForClass(OrderDocument);

OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });
