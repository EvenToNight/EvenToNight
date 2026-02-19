import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteractionsModule } from './interactions/interactions.module';
import { MetadataModule } from './metadata/metadata.module';
import { AuthModule } from './commons/auth';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { TransactionManagerModule } from './commons/database/database.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:27017/eventonight?replicaSet=rs0`,
      {
        directConnection: true,
      },
    ),
    RabbitMqModule,
    InteractionsModule,
    MetadataModule,
    AuthModule,
    TransactionManagerModule,
  ],
})
export class AppModule {}
