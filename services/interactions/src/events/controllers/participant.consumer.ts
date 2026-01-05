import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ParticipationService } from '../services/participation.service';

@Controller()
export class ParticipationConsumer {
  constructor(private readonly participationService: ParticipationService) {}

  @EventPattern('participation.created')
  handleParticipationCreated(@Payload() data: unknown) {
    console.log('Received participation created event:', data);
    const wrapper = data as {
      ParticipationCreated: { eventId: string; userId: string };
    };
    const payload = wrapper.ParticipationCreated;
    if (payload && payload.eventId && payload.userId) {
      this.participationService.participate(payload.eventId, payload.userId);
    } else {
      console.error('Invalid payload for participation.created event:', data);
    }
  }
}
