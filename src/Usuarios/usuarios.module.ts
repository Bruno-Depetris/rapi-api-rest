import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './Entities/usuario.entity';
import { Vendedor } from './Entities/vendedor.entity';
import { Repartidor } from './Entities/repartidor.entity';
import { Administrador } from './Entities/admin.entity';

import { UsuarioRepository } from './Repositories/usuario.repository';
import { VendedorRepository } from './Repositories/vendedor.repository';
import { RepartidorRepository } from './Repositories/repartidor.repository';
import { AdministradorRepository } from './Repositories/admin.repository';
import { NegocioRepository } from 'src/Negocios/Repositories/negocio.repository';

import { AuthService } from './Services/auth.service';
import { UsuariosService } from './Services/usuarios.service';

import { AuthModule } from '../auth/auth.module';
import { AuthController } from './Controllers/auth.controller';
import { UsuariosController } from './Controllers/usuarios.controller';
import { Negocio } from 'src/Negocios/Entities/negocio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Vendedor,
      Repartidor,
      Administrador,
      Negocio,
    ]),

    AuthModule,
  ],
  controllers: [AuthController, UsuariosController],
  providers: [

    UsuarioRepository,
    VendedorRepository,
    RepartidorRepository,
    AdministradorRepository,
    NegocioRepository,

    AuthService,
    UsuariosService,
  ],
  exports: [
    AuthService,
    UsuariosService,

    UsuarioRepository,
    VendedorRepository,
    RepartidorRepository,
    AdministradorRepository,
  ],
})
export class UsuariosModule {}