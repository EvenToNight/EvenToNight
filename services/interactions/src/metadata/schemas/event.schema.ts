import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EventStatus {
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ versionKey: false })
export class Event extends Document {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true, index: true })
  creatorId: string;

  @Prop({ type: [String], default: [] })
  collaboratorIds: string[];

  @Prop({ required: true })
  status: EventStatus;

  @Prop({ required: true })
  name: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
