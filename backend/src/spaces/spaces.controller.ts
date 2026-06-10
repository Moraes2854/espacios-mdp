import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SpacesService } from './spaces.service';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  findAll() {
    return this.spacesService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.spacesService.findBySlug(slug);
  }

  @Post()
  create(@Body() body: any) {
    return this.spacesService.create(body);
  }
}
