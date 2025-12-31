import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CheckoutService } from '../services/checkout.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(private checkoutService: CheckoutService) {}

  @Post('create')
  async createCheckout(@Body() dto: CreateCheckoutDto) {
    this.logger.log(`Creating checkout for user ${dto.userId}`);
    return this.checkoutService.createCheckout(dto);
  }

  @Post('cancel')
  async cancelCheckout(@Body('reservationId') reservationId: string) {
    this.logger.log(`Cancelling checkout for reservation ${reservationId}`);
    await this.checkoutService.cancelCheckout(reservationId);
    return { status: 'cancelled' };
  }
}
