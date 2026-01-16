import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'users',
  timestamps: true,
  versionKey: false,
  _id: false,
})
export class UserDocument {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  language: string;
}

export type UserDocumentType = HydratedDocument<UserDocument>;

export const UserSchema = SchemaFactory.createForClass(UserDocument);
