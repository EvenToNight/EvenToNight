import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      (ret as any).id = ret._id.toString();
      delete (ret as any)._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      (ret as any).id = ret._id.toString();
      delete (ret as any)._id;
      return ret;
    },
  },
})
export class Review extends Document {
  declare id?: string;

  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  creatorId: string;

  @Prop({ type: [String], index: true })
  collaboratorIds?: string[];

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  comment?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ eventId: 1, userId: 1 }, { unique: true });
