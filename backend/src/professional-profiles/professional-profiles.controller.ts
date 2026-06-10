import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProfessionalProfilesService } from './professional-profiles.service';

@Controller('professional-profiles')
export class ProfessionalProfilesController {
  constructor(private readonly profilesService: ProfessionalProfilesService) {}

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.profilesService.create(body);
  }
}
