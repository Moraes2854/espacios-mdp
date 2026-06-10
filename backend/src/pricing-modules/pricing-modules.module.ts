import { Module } from '@nestjs/common';
import { PricingModulesController } from './pricing-modules.controller';
import { PricingModulesService } from './pricing-modules.service';

@Module({
  controllers: [PricingModulesController],
  providers: [PricingModulesService],
  exports: [PricingModulesService],
})
export class PricingModulesModule {}
