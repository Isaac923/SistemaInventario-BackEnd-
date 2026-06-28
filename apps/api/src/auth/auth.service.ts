import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usuarios: UsuariosService,
    private jwt: JwtService,
  ) {}

  async signup(email: string, password: string, adminPassword: string) {
    const expectedAdminPass = process.env.ADMIN_PASSWORD ?? 'admin123';
    if (adminPassword !== expectedAdminPass) {
      throw new UnauthorizedException('Contraseña de administrador incorrecta');
    }

    const usuario = await this.usuarios.create(email, password);
    return this.firmarToken(usuario.id, usuario.email);
  }

  async login(email: string, password: string) {
    const usuario = await this.usuarios.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const esValido = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValido) throw new UnauthorizedException('Credenciales inválidas');

    return this.firmarToken(usuario.id, usuario.email);
  }

  private firmarToken(sub: string, email: string) {
    const access_token = this.jwt.sign(
      { sub, email },
      { expiresIn: Number(process.env.JWT_EXPIRES) ?? 86400 },
    );
    return { access_token };
  }
}