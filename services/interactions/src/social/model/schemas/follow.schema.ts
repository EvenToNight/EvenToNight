import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class Follow extends Document {
  @Prop({ required: true, index: true })
  followerId: string;

  @Prop({ required: true, index: true })
  followedId: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
FollowSchema.index({ followerId: 1, followedId: 1 }, { unique: true });
