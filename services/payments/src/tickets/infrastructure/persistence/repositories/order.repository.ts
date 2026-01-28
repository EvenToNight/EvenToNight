import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../../domain/aggregates/order.aggregate';
import { OrderRepository } from '../../../domain/repositories/order.repository.interface';
import { OrderMapper } from '../mappers/order.mapper';
import { OrderDocument } from '../schemas/order.schema';
import { BaseMongoRepository } from './base-mongo.repository';

@Injectable()
export class OrderRepositoryImpl
  extends BaseMongoRepository
  implements OrderRepository
{
  constructor(
    @InjectModel(OrderDocument.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {
    super();
  }
  async save(order: Order): Promise<Order> {
    const document = OrderMapper.toPersistence(order);
    const created = new this.orderModel(document);
    const saved = await created.save();
    return OrderMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Order | null> {
    const document = await this.orderModel.findById(id).exec();
    return document ? OrderMapper.toDomain(document) : null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const documents = await this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return documents.map((doc) => OrderMapper.toDomain(doc));
  }

  async update(order: Order): Promise<Order> {
    const document = OrderMapper.toPersistence(order);
    const updated = await this.orderModel
      .findByIdAndUpdate(order.getId(), document, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`Order with id ${order.getId()} not found`);
    }

    return OrderMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.orderModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.orderModel.deleteMany({}).exec();
  }
}
