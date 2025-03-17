import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { format } from 'date-fns';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>
  ) {}

  async findAll(page: number = 1, perPage: number = 10): Promise<{ orders: Order[]; total: number; page: number; perPage: number }> {
    const skip = (page - 1) * perPage;
    const [orders, total] = await Promise.all([
      this.orderModel.find().skip(skip).limit(perPage).sort({ date: -1 }).exec(),
      this.orderModel.countDocuments()
    ]);
    
    return {
      orders,
      total,
      page,
      perPage
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel(createOrderDto);
    return newOrder.save();
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();
      
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return updatedOrder;
  }

  async remove(id: string): Promise<Order> {
    const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
    
    if (!deletedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return deletedOrder;
  }
  
  // Format order data for API response
  formatOrder(order: Order) {
    return {
      id: order._id,
      customer: order.customer,
      product: order.product,
      date: format(order.date, 'MMM dd, yyyy'),
      total: `$${order.total.toFixed(2)}`,
      status: order.status,
    };
  }
}