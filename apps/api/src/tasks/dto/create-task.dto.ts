import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Matches, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { PriorityValues } from './priority';
import type { Priority } from './priority';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
class IsFutureDate implements ValidatorConstraintInterface {
  validate(date: string) {
    return new Date(date) > new Date();
  }
  defaultMessage() {
    return 'La fecha de vencimiento no puede ser en el pasado';
  }
}

export class CreateTaskDto {
  @ApiProperty({ description: 'Código único del producto', example: 'SKU-001' })
  @IsString()
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres' })
  code!: string;

  @ApiProperty({ description: 'Título del Producto', minLength: 3, example: 'Producto nuevo' })
  @IsString()
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  title!: string;

  @ApiProperty({ required: false, description: 'Descripción del Producto', example: 'Descripción del producto' })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  description?: string;

  @ApiProperty({ enum: PriorityValues, default: 'MEDIUM', description: 'Prioridad del Producto', example: 'MEDIUM' })
  @IsOptional()
  @IsEnum(PriorityValues, { message: 'La prioridad debe ser LOW, MEDIUM o HIGH' })
  priority?: Priority = 'MEDIUM';

  @ApiProperty({ required: false, description: 'Fecha de vencimiento (formato YYYY-MM-DD)', example: '2026-12-31' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD, ejemplo: 2026-12-31' })
  @Validate(IsFutureDate)
  dueDate?: string;
}