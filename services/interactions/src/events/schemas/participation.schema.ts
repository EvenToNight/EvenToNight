import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Participation extends Document {
  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  userId: string;
}

export const ParticipationSchema = SchemaFactory.createForClass(Participation);

ParticipationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
