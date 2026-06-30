import { ApiProperty } from '@nestjs/swagger';
import { PriorityValues } from '../dto/priority';
import type { Priority } from '../dto/priority';

export class Product {
  @ApiProperty({ description: 'Identificador único del producto', example: 'ckxyz7krg0000qz8a5gqzfta4' })
  id!: string;

  @ApiProperty({ description: 'Código único del producto', example: 'SKU-001' })
  code!: string;

  @ApiProperty({ description: 'Título del producto', example: 'Producto nuevo' })
  title!: string;

  @ApiProperty({ description: 'Descripción del producto', example: 'Descripción del producto', required: false })
  description?: string | null;

  @ApiProperty({ description: 'Prioridad del producto', enum: PriorityValues, example: 'MEDIUM' })
  priority!: Priority;

  @ApiProperty({ description: 'Fecha de creación', example: '2026-05-24T12:34:56.789Z' })
  createdAt!: string;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2026-05-24T12:34:56.789Z' })
  updatedAt!: string;
}
