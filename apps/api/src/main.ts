import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Inventario Super UCM')
    .setDescription('Sistema de gestión de inventario - UCM')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  const prisma = app.get(PrismaService);
  await seedAdmin(prisma);
}

async function seedAdmin(prisma: PrismaService) {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@supermercado.cl';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

  const existing = await prisma.usuario.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.usuario.create({
      data: { email: adminEmail, passwordHash, nombre: 'Administrador' },
    });
    console.log(`Admin creado: ${adminEmail}`);
  } else {
    console.log(`Admin ya existe: ${adminEmail}`);
  }
}

bootstrap();

const config = new DocumentBuilder()
  .setTitle('Supermercado API')
  .setDescription('API de gestión de productos por usuario')
  .setVersion('1.0')
  .addBearerAuth()   // ← IMPORTANTE
  .build(); 