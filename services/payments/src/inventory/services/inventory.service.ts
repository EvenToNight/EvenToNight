import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TicketCategory } from '../schemas/ticket-category.schema';
import { CreateTicketCategoryDto } from '../dto/create-ticket-category.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(TicketCategory.name)
    private ticketCategoryModel: Model<TicketCategory>,
  ) {}

  /**
   * Create ticket categories for an event
   */
  async createTicketCategories(
    eventId: string,
    categories: CreateTicketCategoryDto[],
  ): Promise<TicketCategory[]> {
    const categoryDocs = categories.map((cat) => ({
      eventId,
      name: cat.name,
      description: cat.description,
      price: cat.price,
      totalCapacity: cat.totalCapacity,
      saleStartDate: cat.saleStartDate ? new Date(cat.saleStartDate) : null,
      saleEndDate: cat.saleEndDate ? new Date(cat.saleEndDate) : null,
      isActive: cat.isActive ?? true,
      sold: 0,
      reserved: 0,
    }));

    return this.ticketCategoryModel.insertMany(categoryDocs) as any;
  }

  /**
   * Get all ticket categories for an event
   */
  async getEventCategories(eventId: string): Promise<TicketCategory[]> {
    return this.ticketCategoryModel.find({ eventId }).exec();
  }

  /**
   * Get active ticket categories for an event (for public display)
   */
  async getActiveCategories(eventId: string): Promise<TicketCategory[]> {
    const now = new Date();

    return this.ticketCategoryModel
      .find({
        eventId,
        isActive: true,
        $and: [
          {
            $or: [
              { saleStartDate: null },
              { saleStartDate: { $lte: now } }
            ]
          },
          {
            $or: [
              { saleEndDate: null },
              { saleEndDate: { $gte: now } }
            ]
          }
        ]
      })
      .exec();
  }

  /**
   * Get a specific category by ID
   */
  async getCategoryById(categoryId: string): Promise<TicketCategory> {
    const category = await this.ticketCategoryModel.findById(categoryId).exec();

    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }

    return category;
  }

  /**
   * Update category capacity or other properties
   */
  async updateCategory(
    categoryId: string,
    updates: Partial<TicketCategory>,
  ): Promise<TicketCategory> {
    const category = await this.ticketCategoryModel
      .findByIdAndUpdate(categoryId, updates, { new: true })
      .exec();

    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }

    return category;
  }

  /**
   * Check if event has available tickets
   */
  async hasAvailableTickets(eventId: string): Promise<boolean> {
    const categories = await this.getActiveCategories(eventId);

    return categories.some((cat) => {
      const available = cat.totalCapacity - cat.sold - cat.reserved;
      return available > 0;
    });
  }

  /**
   * Get total available tickets for an event
   */
  async getTotalAvailable(eventId: string): Promise<number> {
    const categories = await this.getActiveCategories(eventId);

    return categories.reduce((total, cat) => {
      const available = cat.totalCapacity - cat.sold - cat.reserved;
      return total + available;
    }, 0);
  }

  /**
   * Get sales analytics for an event
   */
  async getEventSales(eventId: string) {
    const categories = await this.getEventCategories(eventId);

    const totalRevenue = categories.reduce(
      (sum, cat) => sum + cat.sold * cat.price,
      0,
    );

    const ticketsSold = categories.reduce((sum, cat) => sum + cat.sold, 0);

    const categoriesBreakdown = categories.map((cat) => ({
      name: cat.name,
      sold: cat.sold,
      revenue: cat.sold * cat.price,
      available: cat.totalCapacity - cat.sold - cat.reserved,
    }));

    return {
      eventId,
      totalRevenue,
      ticketsSold,
      categoriesBreakdown,
    };
  }
}
