import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, role: Role = Role.CAJERO, nombre?: string, actionPassword?: string) {
    const existe = await this.prisma.usuario.findUnique({ where: { email } });
    if (existe) throw new ConflictException('El usuario ya existe');

    const passwordHash = await bcrypt.hash(password, 10);
    const actionPasswordHash = actionPassword ? await bcrypt.hash(actionPassword, 10) : null;
    return this.prisma.usuario.create({
      data: { email, passwordHash, nombre: nombre ?? email, role, actionPasswordHash },
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, nombre: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  findFirstAdmin() {
    return this.prisma.usuario.findFirst({ where: { role: Role.ADMIN }, orderBy: { createdAt: 'asc' } });
  }

  findAdminsWithActionPassword() {
    return this.prisma.usuario.findMany({
      where: { role: Role.ADMIN, actionPasswordHash: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  async update(id: string, data: { email?: string; nombre?: string; password?: string; role?: Role; actionPassword?: string }) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    if (data.actionPassword !== undefined) {
      updateData.actionPasswordHash = data.actionPassword ? await bcrypt.hash(data.actionPassword, 10) : null;
    }

    return this.prisma.usuario.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    await this.prisma.usuario.delete({ where: { id } });
    return { ok: true };
  }
}