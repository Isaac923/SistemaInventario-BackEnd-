import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsuarioActual } from '../auth/usuario-actual.decorator';

type JwtUsuario = { sub: string; username: string };

@ApiTags('productos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('productos')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@UsuarioActual() usuario: JwtUsuario, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(usuario.sub, dto);
  }

  @Get()
  findAll(
    @UsuarioActual() usuario: JwtUsuario,
    @Query('skip') skip = '0',
    @Query('take') take = '20',
  ) {
    return this.tasksService.findAll(usuario.sub, Number(skip), Number(take));
  }

  @Get(':id')
  findOne(@UsuarioActual() usuario: JwtUsuario, @Param('id') id: string) {
    return this.tasksService.findOne(usuario.sub, id);
  }

  @Patch(':id')
  update(
    @UsuarioActual() usuario: JwtUsuario,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(usuario.sub, id, dto);
  }

  @Delete(':id')
  remove(@UsuarioActual() usuario: JwtUsuario, @Param('id') id: string) {
    return this.tasksService.remove(usuario.sub, id);
  }
}