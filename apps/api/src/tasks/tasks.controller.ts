import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Tareas')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo producto en el sistema' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos del inventario' })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  findAll(@Query('skip') skip = '0', @Query('take') take = '20') {
    return this.tasksService.findAll(Number(skip), Number(take));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar producto por su identificador' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto del sistema' })
  @ApiResponse({ status: 200, description: 'Producto eliminado ' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}