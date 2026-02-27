import { Injectable } from '@nestjs/common';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';
import { EventService } from '../services/event.service';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class CreateEventHandler {
  constructor(private readonly eventService: EventService) {}

  async handle(eventId: string, dto: CreateEventDto): Promise<void> {
    await this.eventService.save(
      Event.create({
        id: EventId.fromString(eventId),
        creatorId: UserId.fromString(dto.creatorId),
        date: dto.date,
        title: dto.title,
        status: EventStatus.fromString(dto.status),
      }),
    );
  }
}
