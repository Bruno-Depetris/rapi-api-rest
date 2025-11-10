import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Producto } from './Entities/producto.entity';
import { CategoriaProducto } from '../Productos/Entities/categoriaproducto.entity';
import { Vendedor } from '../Usuarios/Entities/vendedor.entity';

import { ProductoRepository } from '../Productos/Repositories/producto.repository';
import { CategoriaProductoRepository } from '../Productos/Repositories/categoria.repository';
import { VendedorRepository } from '../Usuarios/Repositories/vendedor.repository';


import { ProductosService } from '../Productos/Services/producto.service';
import { CategoriasProductosService } from '../Productos/Services/categoriaproducto.service';

import { ProductosController } from './Controllers/producto.controller';
import { CategoriasProductosController } from './Controllers/categoriaproducto.controller';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producto,
      CategoriaProducto,
      Vendedor,
    ]),
    AuthModule,
  ],
  controllers: [
    ProductosController,
    CategoriasProductosController,
  ],
  providers: [
    ProductoRepository,
    CategoriaProductoRepository,
    VendedorRepository,
    ProductosService,
    CategoriasProductosService,
  ],
  exports: [
    ProductosService,
    CategoriasProductosService,
    ProductoRepository,
    CategoriaProductoRepository,
  ],
})
export class ProductosModule {}