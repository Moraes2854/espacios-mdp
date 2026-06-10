import { IsArray, IsBoolean, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsInt()
  @Min(1)
  sizeM2!: number;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsInt()
  @IsPositive()
  hourlyPrice!: number;

  @IsInt()
  @IsPositive()
  recurrentHourlyPrice!: number;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
