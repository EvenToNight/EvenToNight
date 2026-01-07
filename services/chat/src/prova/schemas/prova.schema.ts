import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProvaDocument = Prova & Document;

@Schema({ timestamps: true })
export class Prova {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true })
  cognome: string;

  @Prop()
  email: string;

  @Prop({ default: 0 })
  eta: number;
}

export const ProvaSchema = SchemaFactory.createForClass(Prova);
