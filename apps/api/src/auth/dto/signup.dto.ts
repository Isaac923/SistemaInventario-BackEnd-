import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export { Role };

export class SignUpDto {
  @ApiProperty({ example: 'admin@correo.cl' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'admin123', description: 'Contraseña maestra de administrador' })
  @IsString()
  adminPassword!: string;

  @ApiProperty({ required: false, example: 'accion123', description: 'Contraseña de acción para cajeros (solo ADMIN)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  adminActionPassword?: string;

  @ApiProperty({ required: false, enum: Role, default: Role.CAJERO })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.CAJERO;
}