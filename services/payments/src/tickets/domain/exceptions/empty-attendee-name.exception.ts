export class EmptyAttendeeNameException extends Error {
  constructor() {
    super('Attendee name cannot be empty');
    this.name = 'EmptyAttendeeNameException';
  }
}
