import { Controller, Post, Get, Param, Body, Logger } from '@nestjs/common';
import { RefundService } from '../services/refund.service';
import { CreateRefundDto } from '../dto/create-refund.dto';

@Controller('admin/refunds')
export class RefundController {
  private readonly logger = new Logger(RefundController.name);

  constructor(private refundService: RefundService) {}

  @Post()
  async createRefund(@Body() dto: CreateRefundDto) {
    this.logger.log(`Creating refund for order ${dto.orderId}`);
    return this.refundService.processRefund(dto);
  }

  @Get('order/:orderId')
  async getOrderRefunds(@Param('orderId') orderId: string) {
    this.logger.log(`Getting refunds for order ${orderId}`);
    return this.refundService.getOrderRefunds(orderId);
  }

  @Post('events/:eventId/cancel')
  async cancelEvent(
    @Param('eventId') eventId: string,
    @Body('reason') reason: string,
  ) {
    this.logger.log(`Cancelling event ${eventId} and processing refunds`);
    await this.refundService.processEventCancellationRefunds(eventId, reason);
    return { message: 'Event cancelled and refunds processed' };
  }
}
