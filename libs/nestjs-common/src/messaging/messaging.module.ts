import { Global, Module } from '@nestjs/common';
import { EventPublisher } from './event-publisher.service';

@Global()
@Module({
  providers: [EventPublisher],
  exports: [EventPublisher],
})
export class MessagingModule {}
