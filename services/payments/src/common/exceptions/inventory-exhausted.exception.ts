import { BadRequestException } from '@nestjs/common';

export class InventoryExhaustedException extends BadRequestException {
  constructor(message: string = 'Not enough tickets available') {
    super(message);
  }
}
