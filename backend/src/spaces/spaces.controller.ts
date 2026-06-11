import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { SpacesService } from './spaces.service';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.spacesService.findAll({ includeInactive: includeInactive === 'true' });
  }

  @Get(':id')
  findByIdOrSlug(@Param('id') id: string) {
    return this.spacesService.findByIdOrSlug(id);
  }

  @Post()
  create(@Body() data: CreateSpaceDto) {
    return this.spacesService.create(data);
  }

  @Patch(':id/activation')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.spacesService.setActive(id, Boolean(isActive));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateSpaceDto) {
    return this.spacesService.update(id, data);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.spacesService.deactivate(id);
  }
}
