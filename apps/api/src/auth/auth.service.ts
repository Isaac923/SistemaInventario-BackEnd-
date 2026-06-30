import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usuarios: UsuariosService,
    private jwt: JwtService,
  ) {}

  async signup(email: string, password: string, adminPassword: string, role: Role = Role.CAJERO, adminActionPassword?: string) {
    const expectedAdminPass = process.env.ADMIN_PASSWORD ?? 'admin123';
    if (adminPassword !== expectedAdminPass) {
      throw new UnauthorizedException('Contraseña de administrador incorrecta');
    }

    const usuario = await this.usuarios.create(email, password, role, undefined, adminActionPassword);
    return this.firmarToken(usuario.id, usuario.email, usuario.role);
  }

  async login(email: string, password: string) {
    const usuario = await this.usuarios.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const esValido = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValido) throw new UnauthorizedException('Credenciales inválidas');

    return this.firmarToken(usuario.id, usuario.email, usuario.role);
  }

  async verificarActionPassword(actionPassword: string) {
    const admin = await this.usuarios.findFirstAdmin();
    if (!admin) {
      throw new UnauthorizedException('No hay administradores registrados');
    }

    const adminsConPass = await this.usuarios.findAdminsWithActionPassword();
    if (adminsConPass.length === 0) {
      throw new UnauthorizedException('El administrador no ha configurado una contraseña de acción. Ve a Gestión de Usuarios → Editar para establecerla.');
    }

    for (const a of adminsConPass) {
      if (await bcrypt.compare(actionPassword, a.actionPasswordHash!)) {
        return;
      }
    }
    throw new UnauthorizedException('Contraseña de acción incorrecta');
  }

  firmarToken(sub: string, email: string, role: Role) {
    const access_token = this.jwt.sign(
      { sub, email, role },
      { expiresIn: Number(process.env.JWT_EXPIRES) ?? 86400 },
    );
    return { access_token };
  }
}