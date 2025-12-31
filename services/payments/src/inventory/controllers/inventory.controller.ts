import { Controller, Get, Post, Patch, Param, Body, Logger } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { SetupInventoryDto } from '../dto/create-ticket-category.dto';

@Controller()
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private inventoryService: InventoryService) {}

  @Post('admin/events/:eventId/inventory/setup')
  async setupInventory(
    @Param('eventId') eventId: string,
    @Body() dto: SetupInventoryDto,
  ) {
    this.logger.log(`Setting up inventory for event ${eventId}`);
    return this.inventoryService.createTicketCategories(eventId, dto.categories);
  }

  @Get('events/:eventId/tickets')
  async getEventTickets(@Param('eventId') eventId: string) {
    this.logger.log(`Getting tickets for event ${eventId}`);
    return this.inventoryService.getActiveCategories(eventId);
  }

  @Get('events/:eventId/availability')
  async checkAvailability(@Param('eventId') eventId: string) {
    this.logger.log(`Checking availability for event ${eventId}`);
    const hasAvailable = await this.inventoryService.hasAvailableTickets(eventId);
    const totalAvailable = await this.inventoryService.getTotalAvailable(eventId);

    return {
      hasAvailableTickets: hasAvailable,
      totalAvailable,
    };
  }

  @Get('admin/events/:eventId/sales')
  async getEventSales(@Param('eventId') eventId: string) {
    this.logger.log(`Getting sales data for event ${eventId}`);
    return this.inventoryService.getEventSales(eventId);
  }
}
