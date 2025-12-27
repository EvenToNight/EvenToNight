import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class Event extends Document {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ type: [String], default: [] })
  collaboratorIds: string[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
