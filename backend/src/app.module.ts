import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfessionalProfilesModule } from './professional-profiles/professional-profiles.module';
import { SpacesModule } from './spaces/spaces.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { LeadsModule } from './leads/leads.module';
import { PaymentsModule } from './payments/payments.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AdminModule } from './admin/admin.module';
import { AvailabilityRulesModule } from './availability-rules/availability-rules.module';
import { AvailabilityBlocksModule } from './availability-blocks/availability-blocks.module';
import { RecurringBookingRulesModule } from './recurring-booking-rules/recurring-booking-rules.module';
import { PricingModulesModule } from './pricing-modules/pricing-modules.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProfessionalProfilesModule,
    SpacesModule,
    AvailabilityModule,
    BookingsModule,
    LeadsModule,
    PaymentsModule,
    AuditLogModule,
    AdminModule,
    AvailabilityRulesModule,
    AvailabilityBlocksModule,
    RecurringBookingRulesModule,
    PricingModulesModule,
  ],
})
export class AppModule {}
