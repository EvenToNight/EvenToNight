import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  EVENT_REPOSITORY,
  type EventRepository,
} from 'src/tickets/domain/repositories/event.repository.interface';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
@Injectable()
export class EventService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async findById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  async save(event: Event): Promise<Event> {
    return this.eventRepository.save(event);
  }

  async delete(id: string): Promise<void> {
    return this.eventRepository.delete(id);
  }
}
