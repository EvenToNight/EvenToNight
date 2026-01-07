import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  organizationId: string;

  @Prop({ required: true })
  memberId: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ organizationId: 1 });
ConversationSchema.index({ memberId: 1 });
ConversationSchema.index({ organizationId: 1, memberId: 1 }, { unique: true });
