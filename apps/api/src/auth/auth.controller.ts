import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, Role } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import { UsuarioActual } from './usuario-actual.decorator';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Registrar nuevo usuario', description: 'Crea un usuario (ADMIN o CAJERO). Requiere contraseña maestra de admin. Si es ADMIN, puede incluir una contraseña de acción para los cajeros.' })
  signup(@Body() dto: SignUpDto) {
    return this.auth.signup(dto.email, dto.password, dto.adminPassword, dto.role, dto.adminActionPassword);
  }

  @Post('ingresar')
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Autentica con email y contraseña, devuelve un token JWT.' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('yo')
  @ApiOperation({ summary: 'Ver mi sesión', description: 'Devuelve los datos del usuario autenticado (sub, email, role).' })
  me(@UsuarioActual() usuario: any) {
    return usuario;
  }
}