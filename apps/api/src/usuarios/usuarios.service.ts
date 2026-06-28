import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(username: string, password: string) {
    const existe = await this.prisma.usuario.findUnique({ where: { email: username } });
    if (existe) throw new ConflictException('El usuario ya existe');

    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.usuario.create({ data: { email: username, passwordHash, nombre: username } });
  }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }
}