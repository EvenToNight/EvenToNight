import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'outbox',
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class OutboxDocument {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ required: true })
  eventType!: string;

  @Prop({ required: true })
  payload!: string;

  @Prop({ required: true })
  occurredAt!: Date;

  @Prop({ type: Date, default: null })
  processedAt!: Date | null;
}

export type OutboxDocumentType = HydratedDocument<OutboxDocument>;

export const OutboxSchema = SchemaFactory.createForClass(OutboxDocument);

OutboxSchema.index({ processedAt: 1 });
OutboxSchema.index({ occurredAt: 1 });
