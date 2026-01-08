import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { UsersService } from '../services/users.service';

@Controller()
export class UserConsumer {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('user.created')
  async handleUserCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Received user.created event:', data);

    try {
      await this.usersService.upsertUser({
        userId: data.userId,
        name: data.name,
        avatar: data.avatar,
      });

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      console.error('Error caching user:', error);
    }
  }
}
