import { Module } from '@nestjs/common';
import { AvailabilityBlocksController } from './availability-blocks.controller';
import { AvailabilityBlocksService } from './availability-blocks.service';

@Module({
  controllers: [AvailabilityBlocksController],
  providers: [AvailabilityBlocksService],
})
export class AvailabilityBlocksModule {}
