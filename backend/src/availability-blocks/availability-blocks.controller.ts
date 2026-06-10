import { Body, Controller, Get, Post } from '@nestjs/common';
import { AvailabilityBlocksService } from './availability-blocks.service';

@Controller('availability-blocks')
export class AvailabilityBlocksController {
  constructor(private readonly availabilityBlocksService: AvailabilityBlocksService) {}

  @Get()
  findAll() {
    return this.availabilityBlocksService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.availabilityBlocksService.create(body);
  }
}
