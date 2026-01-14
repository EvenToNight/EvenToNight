import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  MEMBER = 'member',
  ORGANIZATION = 'organization',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop()
  name: string;

  @Prop()
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ userId: 1 }, { unique: true });
UserSchema.index({ role: 1 });
