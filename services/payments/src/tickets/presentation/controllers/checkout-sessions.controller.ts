import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { CreateCheckoutSessionHandler } from '../../application/handlers/create-checkout-session.handler';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
} from '../../application/dto/create-checkout-session.dto';

@Controller('checkout-sessions')
export class CheckoutSessionsController {
  constructor(
    private readonly createCheckoutSessionHandler: CreateCheckoutSessionHandler,
  ) {}

  /**
   * Create a new checkout session for multiple tickets
   * POST /checkout-sessions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCheckoutSession(
    @Body(ValidationPipe) dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    return this.createCheckoutSessionHandler.handle(dto);
  }
}
