import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(@Query('userId') userId?: string, @Query('status') status?: BookingStatus) {
    return this.bookingsService.findAll({ userId, status });
  }

  @Post()
  create(@Body() body: any) {
    return this.bookingsService.create(body);
  }
}
