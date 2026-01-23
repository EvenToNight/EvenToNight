import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteractionsModule } from './interactions/interactions.module';
import { MetadataModule } from './metadata/metadata.module';
import { AuthModule } from './commons/auth';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:27017/eventonight`,
    ),
    InteractionsModule,
    MetadataModule,
    AuthModule,
  ],
})
export class AppModule {}
