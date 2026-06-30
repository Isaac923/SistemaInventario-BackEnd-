import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  cantidad?: number = 0;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  precio?: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  adminPassword?: string;
}