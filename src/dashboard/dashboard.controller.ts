import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('sales')
  async getSalesData() {
    return this.dashboardService.getSalesData();
  }

  @UseGuards(JwtAuthGuard)
  @Get('activities')
  async getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }
}