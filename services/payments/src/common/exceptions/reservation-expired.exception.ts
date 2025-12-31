import { BadRequestException } from '@nestjs/common';

export class ReservationExpiredException extends BadRequestException {
  constructor(message: string = 'Reservation has expired') {
    super(message);
  }
}
