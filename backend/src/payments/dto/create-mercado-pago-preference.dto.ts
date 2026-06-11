import { IsEmail, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreateMercadoPagoPreferenceDto {
  @IsString()
  title!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsOptional()
  @IsEmail()
  payerEmail?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
