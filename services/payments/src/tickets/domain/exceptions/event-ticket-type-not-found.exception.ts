export class EventTicketTypeNotFoundException extends Error {
  constructor(ticketTypeId?: string) {
    super(
      ticketTypeId
        ? `EventTicketType with id ${ticketTypeId} not found`
        : 'EventTicketType not found',
    );
    this.name = 'EventTicketTypeNotFoundException';
  }
}
