import { Module } from '@nestjs/common';
import { RecurringBookingRulesController } from './recurring-booking-rules.controller';
import { RecurringBookingRulesService } from './recurring-booking-rules.service';

@Module({
  controllers: [RecurringBookingRulesController],
  providers: [RecurringBookingRulesService],
})
export class RecurringBookingRulesModule {}
