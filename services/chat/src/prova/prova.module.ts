import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProvaController } from './controllers/prova.controller';
import { ProvaService } from './services/prova.service';
import { Prova, ProvaSchema } from './schemas/prova.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Prova.name, schema: ProvaSchema }]),
  ],
  controllers: [ProvaController],
  providers: [ProvaService],
  exports: [ProvaService],
})
export class ProvaModule {}
