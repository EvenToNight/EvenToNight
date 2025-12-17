import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, versionKey: false })
export class Like extends Document {
  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  userId: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.index({ eventId: 1, userId: 1 }, { unique: true });
