import { Module } from '@nestjs/common';
import { UserModule } from 'src/users/user.module';
import { EventModule } from 'src/events/event.module';

@Module({
  imports: [UserModule, EventModule],
})
export class InteractionsModule {}
