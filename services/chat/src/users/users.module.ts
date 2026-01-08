// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './services/users.service';
import { UserConsumer } from './consumers/users.consumer';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserConsumer],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
