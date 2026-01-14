import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { OrderRepository } from 'src/tickets/domain/repositories/order.repository.interface';
import { ORDER_REPOSITORY } from 'src/tickets/domain/repositories/order.repository.interface';
import { Order } from 'src/tickets/domain/aggregates/order.aggregate';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async createOrder(userId: UserId, ticketIds: string[]): Promise<Order> {
    const order = Order.createPending({ userId, ticketIds });
    await this.orderRepository.save(order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }
}
