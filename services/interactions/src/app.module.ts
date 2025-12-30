import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteractionsModule } from './interactions/interactions.module';
import { MetadataModule } from './metadata/metadata.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:27017/interactions`,
    ),
    InteractionsModule,
    MetadataModule,
  ],
})
export class AppModule {}
