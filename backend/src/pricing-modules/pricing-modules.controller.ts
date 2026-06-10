import { Body, Controller, Get, Post } from '@nestjs/common';
import { PricingModulesService } from './pricing-modules.service';

@Controller('pricing-modules')
export class PricingModulesController {
  constructor(private readonly pricingModulesService: PricingModulesService) {}

  @Get()
  findAll() {
    return this.pricingModulesService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.pricingModulesService.create(body);
  }
}
