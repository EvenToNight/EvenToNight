import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ParticipationService } from '../services/participation.service';

@Controller()
export class ParticipationConsumer {
  constructor(private readonly participationService: ParticipationService) {}

  // TODO: implement handle events participation
  @EventPattern('test')
  handleTicketPurchased(@Payload() data: unknown) {
    console.log('Received event:', data);
  }
}
