import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'events',
  timestamps: true,
  versionKey: false,
  _id: false,
})
export class EventDocument {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  creatorId: string;

  @Prop()
  date: Date;

  @Prop({ required: true })
  status: string;

  @Prop()
  title: string;
}

export type EventDocumentType = HydratedDocument<EventDocument>;

export const EventSchema = SchemaFactory.createForClass(EventDocument);
