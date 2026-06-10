import { Module } from '@nestjs/common';
import { AvailabilityRulesController } from './availability-rules.controller';
import { AvailabilityRulesService } from './availability-rules.service';

@Module({
  controllers: [AvailabilityRulesController],
  providers: [AvailabilityRulesService],
})
export class AvailabilityRulesModule {}
