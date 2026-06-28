import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(usuarioId: string, dto: CreateTaskDto) {
    const { dueDate, ...rest } = dto;
    return this.prisma.producto.create({
      data: {
        ...rest,
        usuarioId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
  }

  findAll(usuarioId: string, skip = 0, take = 20) {
    return this.prisma.producto.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async findOne(usuarioId: string, id: string) {
    const producto = await this.prisma.producto.findFirst({
      where: { id, usuarioId },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async update(usuarioId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(usuarioId, id);
    const { dueDate, ...rest } = dto;
    return this.prisma.producto.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
      },
    });
  }

  async remove(usuarioId: string, id: string) {
    await this.findOne(usuarioId, id);
    await this.prisma.producto.delete({ where: { id } });
    return { ok: true };
  }
}