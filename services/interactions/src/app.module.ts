import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteractionsModule } from './interactions/interactions.module';
import { MetadataModule } from './metadata/metadata.module';
import { AuthModule } from './commons/auth';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:27017/eventonight`,
    ),
    RabbitMqModule,
    InteractionsModule,
    MetadataModule,
    AuthModule,
  ],
})
export class AppModule {}
