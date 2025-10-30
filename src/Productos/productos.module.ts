import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {v2 as cloudinary} from 'cloudinary';

// Entities
import { Producto } from './Entities/producto.entity';
import { CategoriaProducto } from '../Productos/Entities/categoriaproducto.entity';
import { Vendedor } from '../Usuarios/Entities/vendedor.entity';

// Repositories
import { ProductoRepository } from '../Productos/Repositories/producto.repository';
import { CategoriaProductoRepository } from '../Productos/Repositories/categoria.repository';
import { VendedorRepository } from '../Usuarios/Repositories/vendedor.repository';

// Services
import { ProductosService } from '../Productos/Services/producto.service';
import { CategoriasProductosService } from '../Productos/Services/categoriaproducto.service';

// Controllers
import { ProductosController } from './Controllers/producto.controller';
import { CategoriasProductosController } from './Controllers/categoriaproducto.controller';

// Auth Module
import { AuthModule } from '../auth/auth.module';

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

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