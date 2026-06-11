import { PricingModuleType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CrearModuloPrecioDto {
  @IsString()
  @IsNotEmpty()
  spaceId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsEnum(PricingModuleType)
  moduleType!: PricingModuleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationHours?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  weeklyHours?: number | null;

  @IsNumber()
  @Min(0)
  pricePerHour!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
