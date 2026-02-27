import { EVENT_REPOSITORY } from 'src/tickets/domain/repositories/event.repository.interface';

describe('EventRepository', () => {
  it('should export EVENT_REPOSITORY token', () => {
    expect(typeof EVENT_REPOSITORY).toBe('symbol');
    expect(EVENT_REPOSITORY.toString()).toBe('Symbol(EVENT_REPOSITORY)');
  });
});
