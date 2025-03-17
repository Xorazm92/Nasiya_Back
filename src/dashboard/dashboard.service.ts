import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Order } from '../orders/schemas/order.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { Payment } from '../payments/schemas/payment.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>
  ) {}

  async getStats() {
    const now = new Date();
    const oneMonthAgo = subMonths(now, 1);
    
    // Calculate total sales for current month
    const currentMonthSales = await this.orderModel.aggregate([
      { $match: { date: { $gte: startOfMonth(now), $lte: endOfMonth(now) } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).exec();
    
    // Calculate total sales for previous month
    const previousMonthSales = await this.orderModel.aggregate([
      { $match: { date: { $gte: startOfMonth(oneMonthAgo), $lte: endOfMonth(oneMonthAgo) } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).exec();
    
    const currentMonthTotal = currentMonthSales.length > 0 ? currentMonthSales[0].total : 0;
    const previousMonthTotal = previousMonthSales.length > 0 ? previousMonthSales[0].total : 0;
    
    // Calculate percentage change
    const salesPercentageChange = previousMonthTotal === 0 
      ? 100 
      : ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    
    // Get order counts
    const currentMonthOrders = await this.orderModel.countDocuments({
      date: { $gte: startOfMonth(now), $lte: endOfMonth(now) }
    }).exec();
    
    const previousMonthOrders = await this.orderModel.countDocuments({
      date: { $gte: startOfMonth(oneMonthAgo), $lte: endOfMonth(oneMonthAgo) }
    }).exec();
    
    const ordersPercentageChange = previousMonthOrders === 0
      ? 100
      : ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100;
    
    // Get customer counts
    const totalCustomers = await this.customerModel.countDocuments().exec();
    const newCustomersLastMonth = await this.customerModel.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    }).exec();
    
    const customerPercentageChange = totalCustomers === 0
      ? 100
      : (newCustomersLastMonth / totalCustomers) * 100;
    
    // Get pending payments
    const pendingPayments = await this.paymentModel.aggregate([
      { $match: { status: 'Processing' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).exec();
    
    const pendingPaymentsTotal = pendingPayments.length > 0 ? pendingPayments[0].total : 0;
    
    // Calculate percentage of pending payments
    const allPaymentsAmount = await this.paymentModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).exec();
    
    const allPaymentsTotal = allPaymentsAmount.length > 0 ? allPaymentsAmount[0].total : 0;
    
    const pendingPaymentsPercentage = allPaymentsTotal === 0
      ? 0
      : (pendingPaymentsTotal / allPaymentsTotal) * 100;
    
    return {
      totalSales: {
        value: `$${currentMonthTotal.toFixed(2)}`,
        percentage: Math.round(salesPercentageChange * 100) / 100,
        trend: salesPercentageChange >= 0 ? 'up' : 'down'
      },
      totalOrders: {
        value: currentMonthOrders,
        percentage: Math.round(ordersPercentageChange * 100) / 100,
        trend: ordersPercentageChange >= 0 ? 'up' : 'down'
      },
      customers: {
        value: totalCustomers,
        percentage: Math.round(customerPercentageChange * 100) / 100,
        trend: 'up' // Assuming customer count only increases
      },
      pendingPayments: {
        value: `$${pendingPaymentsTotal.toFixed(2)}`,
        percentage: Math.round(pendingPaymentsPercentage * 100) / 100,
        trend: pendingPaymentsPercentage > 20 ? 'up' : 'down' // If more than 20% is pending, it's a negative trend
      }
    };
  }
  
  async getSalesData() {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    // Get orders from the last 6 months
    const orders = await this.orderModel.find({
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 }).exec();
    
    // Group by month
    const monthlyData = orders.reduce((acc, order) => {
      const month = format(order.date, 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += order.total;
      return acc;
    }, {});
    
    // Convert to data points array
    const dataPoints = Object.entries(monthlyData).map(([date, value]) => ({
      date,
      value: value as number
    }));
    
    return {
      period: 'Last 6 Months',
      data: dataPoints
    };
  }
  
  async getRecentActivities(limit = 10) {
    // Get recent orders
    const recentOrders = await this.orderModel.find()
      .sort({ date: -1 })
      .limit(limit / 2)
      .exec();
      
    // Get recent payments
    const recentPayments = await this.paymentModel.find()
      .sort({ date: -1 })
      .limit(limit / 2)
      .exec();
    
    // Transform orders into activities
    const orderActivities = recentOrders.map((order, index) => ({
      id: index,
      user: order.customer,
      action: `Placed order ${order._id}`,
      time: format(order.date, 'h:mm a'),
      icon: 'shopping-cart',
      iconBg: '#f9fafb',
      iconColor: '#3b82f6'
    }));
    
    // Transform payments into activities
    const paymentActivities = recentPayments.map((payment, index) => ({
      id: index + orderActivities.length,
      user: payment.customer,
      action: `Made payment of $${payment.amount.toFixed(2)}`,
      time: format(payment.date, 'h:mm a'),
      icon: 'credit-card',
      iconBg: '#f0fdf4',
      iconColor: '#10b981'
    }));
    
    // Combine and sort by time
    const allActivities = [...orderActivities, ...paymentActivities]
      .sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);
    
    return allActivities;
  }
}