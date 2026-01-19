import { Global, Module } from '@nestjs/common';
import { EventPublisher } from './event-publisher';

@Global()
@Module({
  providers: [EventPublisher],
  exports: [EventPublisher],
})
export class MessagingModule {}
