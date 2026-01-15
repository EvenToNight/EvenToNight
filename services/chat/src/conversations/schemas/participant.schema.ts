import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParticipantDocument = Participant & Document;

export enum ParticipantRole {
  MEMBER = 'member',
  ORGANIZATION = 'organization',
}

@Schema()
export class Participant {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, enum: ParticipantRole })
  role: ParticipantRole;

  @Prop({ default: 0 })
  unreadCount: number;

  @Prop({ default: Date.now })
  lastReadAt: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

ParticipantSchema.index({ conversationId: 1, userId: 1 }, { unique: true });
ParticipantSchema.index({ userId: 1 });
ParticipantSchema.index({ conversationId: 1 });
