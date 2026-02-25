import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

@Schema({
  collection: 'inbox',
  versionKey: false,
  _id: false,
})
export class InboxDocument {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ required: true })
  processedAt!: Date;
}

export const InboxSchema = SchemaFactory.createForClass(
  InboxDocument,
);

InboxSchema.index(
  { processedAt: 1 },
  { expireAfterSeconds: THIRTY_DAYS_IN_SECONDS },
);
