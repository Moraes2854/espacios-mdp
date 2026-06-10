import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class ListBookingsQueryDto {
  @IsOptional()
  @IsUUID()
  spaceId?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
