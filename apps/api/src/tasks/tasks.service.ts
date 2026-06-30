import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '@prisma/client';

type UsuarioConRole = { sub: string; role: Role };

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(usuario: UsuarioConRole, dto: CreateTaskDto) {
    const { adminPassword, ...rest } = dto;
    return this.prisma.producto.create({
      data: { ...rest, usuarioId: usuario.sub },
    });
  }

  findAll(skip = 0, take = 20) {
    return this.prisma.producto.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async update(usuario: UsuarioConRole, id: string, dto: UpdateTaskDto) {
    await this.findOne(id);
    const { adminPassword, ...rest } = dto;
    return this.prisma.producto.update({ where: { id }, data: rest });
  }

  async remove(usuario: UsuarioConRole, id: string) {
    await this.findOne(id);
    await this.prisma.producto.delete({ where: { id } });
    return { ok: true };
  }
}