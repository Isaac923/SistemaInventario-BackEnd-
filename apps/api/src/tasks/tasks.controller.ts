import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, Query, UseGuards, Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Role } from '@prisma/client';
import { UsuarioActual } from '../auth/usuario-actual.decorator';
import { AuthService } from '../auth/auth.service';

type JwtUsuario = { sub: string; email: string; role: Role };

@ApiTags('productos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('productos')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@UsuarioActual() usuario: JwtUsuario, @Body() dto: CreateTaskDto) {
    if (usuario.role !== Role.ADMIN) {
      await this.authService.verificarActionPassword(dto.adminPassword ?? '');
    }
    return this.tasksService.create(usuario, dto);
  }

  @Get()
  findAll(
    @UsuarioActual() usuario: JwtUsuario,
    @Query('skip') skip = '0',
    @Query('take') take = '20',
  ) {
    return this.tasksService.findAll(Number(skip), Number(take));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @UsuarioActual() usuario: JwtUsuario,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    if (usuario.role !== Role.ADMIN) {
      await this.authService.verificarActionPassword(dto.adminPassword ?? '');
    }
    return this.tasksService.update(usuario, id, dto);
  }

  @Delete(':id')
  async remove(
    @UsuarioActual() usuario: JwtUsuario,
    @Param('id') id: string,
    @Headers('x-admin-password') adminPassword?: string,
  ) {
    if (usuario.role !== Role.ADMIN) {
      await this.authService.verificarActionPassword(adminPassword ?? '');
    }
    return this.tasksService.remove(usuario, id);
  }
}
