import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'Ingresá un email válido.' })
  email!: string;

  @IsString({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password!: string;

  @IsString({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(80, { message: 'El nombre no puede superar 80 caracteres.' })
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsString({ message: 'El número de documento es obligatorio.' })
  @MinLength(5, { message: 'El número de documento debe tener al menos 5 caracteres.' })
  @MaxLength(30, { message: 'El número de documento no puede superar 30 caracteres.' })
  documentNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  profession?: string;
}
