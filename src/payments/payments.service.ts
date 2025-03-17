import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { format } from 'date-fns';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>
  ) {}

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().sort({ date: -1 }).exec();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const newPayment = new this.paymentModel(createPaymentDto);
    return newPayment.save();
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, updatePaymentDto, { new: true })
      .exec();
      
    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    return updatedPayment;
  }

  async remove(id: string): Promise<Payment> {
    const deletedPayment = await this.paymentModel.findByIdAndDelete(id).exec();
    
    if (!deletedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    return deletedPayment;
  }
  
  // Format payment data for API response
  formatPayment(payment: Payment) {
    return {
      id: payment._id,
      orderId: payment.orderId,
      customer: payment.customer,
      amount: `$${payment.amount.toFixed(2)}`,
      date: format(payment.date, 'MMM dd, yyyy'),
      method: payment.method,
      status: payment.status,
    };
  }
}