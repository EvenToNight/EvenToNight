export class SoldOutException extends Error {
  constructor(ticketTypeName?: string) {
    super(
      ticketTypeName
        ? `Ticket type "${ticketTypeName}" is sold out`
        : 'Tickets are sold out',
    );
    this.name = 'SoldOutException';
  }
}
