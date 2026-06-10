import { Body, Controller, Get, Post } from '@nestjs/common';
import { RecurringBookingRulesService } from './recurring-booking-rules.service';

@Controller('recurring-booking-rules')
export class RecurringBookingRulesController {
  constructor(private readonly recurringBookingRulesService: RecurringBookingRulesService) {}

  @Get()
  findAll() {
    return this.recurringBookingRulesService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.recurringBookingRulesService.create(body);
  }
}
