
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Negocio } from './Entities/negocio.entity';
import { Categoria } from './Entities/categoria.entity';

import { NegocioRepository } from './Repositories/negocio.repository';
import { CategoriaRepository } from './Repositories/categoria.repository';

import { NegociosService } from './Services/negocio.service';
import { CategoriasService } from './Services/categoria.service';

import { NegociosController } from './Controllers/negocio.controller';
import { CategoriasController } from './Controllers/categorias.controller';

import { Vendedor } from '../Usuarios/Entities/vendedor.entity';
import { VendedorRepository } from '../Usuarios/Repositories/vendedor.repository';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Negocio, Categoria, Vendedor]),
    AuthModule,
  ],
  controllers: [NegociosController, CategoriasController],
  providers: [
    NegocioRepository,
    CategoriaRepository,
    VendedorRepository,
    NegociosService,
    CategoriasService,
  ],
  exports: [NegociosService, CategoriasService, NegocioRepository],
})
export class NegociosModule {}