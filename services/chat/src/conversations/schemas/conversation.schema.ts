import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation &
  Document & { createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  organizationId: string;

  @Prop({ required: true })
  userId: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ organizationId: 1 });
ConversationSchema.index({ userId: 1 });
ConversationSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
