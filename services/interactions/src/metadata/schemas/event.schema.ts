import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EventStatus {
  PUBLISHED,
  COMPLETED,
  CANCELLED,
}

@Schema({ versionKey: false })
export class Event extends Document {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true, index: true })
  creatorId: string;

  @Prop({ type: [String], default: [] })
  collaboratorIds: string[];

  @Prop({})
  status: EventStatus;
}

export const EventSchema = SchemaFactory.createForClass(Event);
