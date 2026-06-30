import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false, enum: Role, default: Role.CAJERO })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.CAJERO;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  actionPassword?: string;
}
