import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreatePricingModuleDto } from './dto/create-pricing-module.dto';
import { UpdatePricingModuleDto } from './dto/update-pricing-module.dto';
import { PricingModulesService } from './pricing-modules.service';

@Controller('pricing-modules')
export class PricingModulesController {
  constructor(private readonly pricingModulesService: PricingModulesService) {}

  @Get()
  findAll(
    @Query('spaceId') spaceId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.pricingModulesService.findAll({
      spaceId,
      includeInactive: includeInactive === 'true',
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.pricingModulesService.findById(id);
  }

  @Post()
  create(@Body() data: CreatePricingModuleDto) {
    return this.pricingModulesService.create(data);
  }

  @Patch(':id/activation')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.pricingModulesService.setActive(id, Boolean(isActive));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdatePricingModuleDto) {
    return this.pricingModulesService.update(id, data);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.pricingModulesService.deactivate(id);
  }
}
