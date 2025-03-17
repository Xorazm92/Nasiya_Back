import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { ProductsService } from './products/products.service';
import { CustomersService } from './customers/customers.service';
import { OrdersService } from './orders/orders.service';
import { PaymentsService } from './payments/payments.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User } from './auth/schemas/user.schema';

@Injectable()
export class SeedService {
  constructor(
    private authService: AuthService,
    private productsService: ProductsService,
    private customersService: CustomersService,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async seed() {
    // Clear existing data
    console.log('Clearing existing data...');
    await this.clearData();

    // Seed admin user
    console.log('Creating admin user...');
    await this.seedAdmin();

    // Seed products
    console.log('Creating products...');
    const products = await this.seedProducts();

    // Seed customers
    console.log('Creating customers...');
    const customers = await this.seedCustomers();

    // Seed orders
    console.log('Creating orders...');
    const orders = await this.seedOrders(customers, products);

    // Seed payments
    console.log('Creating payments...');
    await this.seedPayments(orders);

    console.log('Seeding completed successfully!');
  }

  async clearData() {
    // Use with caution - this will delete all data in the database
    // In a real application, you would want more fine-grained control
    await this.userModel.deleteMany({});
    await Promise.all([
      this.productsService.model.deleteMany({}),
      this.customersService.model.deleteMany({}),
      this.ordersService.model.deleteMany({}),
      this.paymentsService.model.deleteMany({}),
    ]);
  }

  async seedAdmin() {
    // Create admin user
    return await this.authService.register({
      username: 'admin',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
    });
  }

  async seedProducts() {
    const productData = [
      {
        name: 'Laptop Pro',
        price: 1499.99,
        stock: 50,
        category: 'Electronics',
        image: 'https://via.placeholder.com/150',
      },
      {
        name: 'Smartphone X',
        price: 999.99,
        stock: 100,
        category: 'Electronics',
        image: 'https://via.placeholder.com/150',
      },
      {
        name: 'Wireless Headphones',
        price: 199.99,
        stock: 200,
        category: 'Audio',
        image: 'https://via.placeholder.com/150',
      },
      {
        name: 'Office Chair',
        price: 299.99,
        stock: 30,
        category: 'Furniture',
        image: 'https://via.placeholder.com/150',
      },
      {
        name: 'Desk Lamp',
        price: 49.99,
        stock: 150,
        category: 'Home',
        image: 'https://via.placeholder.com/150',
      },
    ];

    const products = [];
    for (const product of productData) {
      products.push(await this.productsService.create(product));
    }
    return products;
  }

  async seedCustomers() {
    const customerData = [
      {
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john.doe@example.com',
        totalOrders: 0,
        totalSpent: 0,
      },
      {
        name: 'Jane Smith',
        phone: '+1987654321',
        email: 'jane.smith@example.com',
        totalOrders: 0,
        totalSpent: 0,
      },
      {
        name: 'Bob Johnson',
        phone: '+1122334455',
        email: 'bob.johnson@example.com',
        totalOrders: 0,
        totalSpent: 0,
      },
      {
        name: 'Alice Williams',
        phone: '+1555666777',
        email: 'alice.williams@example.com',
        totalOrders: 0,
        totalSpent: 0,
      },
      {
        name: 'David Brown',
        phone: '+1888999000',
        email: 'david.brown@example.com',
        totalOrders: 0,
        totalSpent: 0,
      },
    ];

    const customers = [];
    for (const customer of customerData) {
      customers.push(await this.customersService.create(customer));
    }
    return customers;
  }

  async seedOrders(customers, products) {
    const orderStatuses = ['Completed', 'Processing', 'Pending Payment', 'Cancelled'];
    const orders = [];

    for (let i = 0; i < 20; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Random date in last 60 days

      const order = await this.ordersService.create({
        customer: customer.name,
        product: product.name,
        date,
        total: product.price,
        status,
      });

      orders.push(order);

      // Update customer stats if order is completed
      if (status === 'Completed') {
        await this.customersService.update(customer._id, {
          totalOrders: customer.totalOrders + 1,
          totalSpent: customer.totalSpent + product.price,
        });
      }
    }

    return orders;
  }

  async seedPayments(orders) {
    const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash'];
    const paymentStatuses = ['Completed', 'Processing', 'Failed'];

    for (const order of orders) {
      // Only create payments for non-cancelled orders
      if (order.status !== 'Cancelled') {
        const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const status = order.status === 'Completed' ? 'Completed' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
        
        await this.paymentsService.create({
          orderId: order._id,
          customer: order.customer,
          amount: order.total,
          date: order.date,
          method,
          status,
        });
      }
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seedService = app.get(SeedService);
  await seedService.seed();
  await app.close();
}

bootstrap();