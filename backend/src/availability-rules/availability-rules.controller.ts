import { Body, Controller, Get, Post } from '@nestjs/common';
import { AvailabilityRulesService } from './availability-rules.service';

@Controller('availability-rules')
export class AvailabilityRulesController {
  constructor(private readonly availabilityRulesService: AvailabilityRulesService) {}

  @Get()
  findAll() {
    return this.availabilityRulesService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.availabilityRulesService.create(body);
  }
}
