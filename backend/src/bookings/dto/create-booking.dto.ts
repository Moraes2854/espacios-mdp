import { IsEmail, IsISO8601, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  spaceId!: string;

  @IsString()
  @MinLength(2)
  customerName!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsString()
  @MinLength(6)
  customerPhone!: string;

  @IsISO8601()
  startAt!: string;

  @IsISO8601()
  endAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
