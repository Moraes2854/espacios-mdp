import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string, @Query('search') search?: string) {
    return this.amenitiesService.findAll({
      includeInactive: includeInactive === 'true',
      search,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.amenitiesService.findById(id);
  }

  @Post()
  create(@Body() data: CreateAmenityDto) {
    return this.amenitiesService.create(data);
  }

  @Patch(':id/activation')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.amenitiesService.setActive(id, Boolean(isActive));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateAmenityDto) {
    return this.amenitiesService.update(id, data);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.amenitiesService.setActive(id, false);
  }
}
