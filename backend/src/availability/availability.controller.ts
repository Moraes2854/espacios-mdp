import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('summary')
  summary() {
    return this.availabilityService.summary();
  }

  @Get('slots')
  slots(@Query('spaceId') spaceId?: string, @Query('from') from?: string, @Query('days') days?: string) {
    return this.availabilityService.slots({ spaceId, from, days });
  }
}
