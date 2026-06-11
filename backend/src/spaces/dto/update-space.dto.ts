import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSpaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number | null;

  @IsOptional()
  @IsString()
  floor?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseHourlyPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  recurrentHourlyPrice?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
