import {v2 as cloudinary} from 'cloudinary';
import * as fs from 'fs';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProductoRepository } from '../Repositories/producto.repository';
import { VendedorRepository } from '../../Usuarios/Repositories/vendedor.repository';
import { CrearProductoDto } from '../DTOs/crearproducto.dto';
import { ActualizarProductoDto } from '../DTOs/actualizarproducto.dto';
import { IProductoService } from '../Interfaces/productoservice.interface';
import { publicDecrypt } from 'crypto';


@Injectable()
export class ProductosService implements IProductoService {
  constructor(
    private readonly productoRepository: ProductoRepository,
    private readonly vendedorRepository: VendedorRepository,
  ) {}

  async listarProductos() {
    const productos = await this.productoRepository.findAll();

    return productos.map((p) => ({
      productoId: p.ProductoId,
      vendedorId: p.VendedorId,
      categoriaProductoId: p.CategoriaProductoId,
      nombre: p.Nombre,
      precio: Number(p.Precio),
      descripcion: p.Descripcion,
      disponibilidad: p.Disponibilidad,
      imagenes: p.Imagenes,
    }));
  }

  async obtenerProducto(id: number) {
    const producto = await this.productoRepository.findById(id);

    if (!producto || producto.IsDeleted) {
      throw new NotFoundException('Producto no encontrado');
    }

    return {
      productoId: producto.ProductoId,
      vendedorId: producto.VendedorId,
      categoriaProductoId: producto.CategoriaProductoId,
      nombre: producto.Nombre,
      precio: Number(producto.Precio),
      descripcion: producto.Descripcion,
      disponibilidad: producto.Disponibilidad,
      imagenes: producto.Imagenes,
    };
  }

  async obtenerMisProductos(usuarioId: number) {
    const vendedor = await this.vendedorRepository.findByUsuarioId(usuarioId);
    if (!vendedor) {
      throw new NotFoundException('No eres vendedor');
    }

    const productos = await this.productoRepository.findByVendedorId(vendedor.VendedorId);

    return productos.map((p) => ({
      productoId: p.ProductoId,
      vendedorId: p.VendedorId,
      categoriaProductoId: p.CategoriaProductoId,
      nombre: p.Nombre,
      precio: Number(p.Precio),
      descripcion: p.Descripcion,
      disponibilidad: p.Disponibilidad,
      imagenes: p.Imagenes,
    }));
  }

  async subirImagen(file: Express.Multer.File){
    if (!file) {
      throw new NotFoundException('No se ha recibido ningún archivo');
    }

    try {
      const resultado = await cloudinary.uploader.upload(file.path, {
        folder: 'productos',
      });

      fs.unlinkSync(file.path);

      return {
        message: 'Imagen subida exitosamente',
        url: resultado.secure_url,
        public_id: resultado.public_id,
      };
    } catch (error) {
      throw new NotFoundException('Error al subir la imagen a Cloudinary');
    }
  }

  async crearProducto(usuarioId: number, crearProductoDto: CrearProductoDto) {
    const vendedor = await this.vendedorRepository.findByUsuarioId(usuarioId);
    if (!vendedor) {
      throw new ForbiddenException('No eres vendedor');
    }

    const nuevoProducto = await this.productoRepository.create({
      ...crearProductoDto,
      VendedorId: vendedor.VendedorId,
    });

    return {
      message: 'Producto creado exitosamente',
      producto: {
        productoId: nuevoProducto.ProductoId,
        vendedorId: nuevoProducto.VendedorId,
        categoriaProductoId: nuevoProducto.CategoriaProductoId,
        nombre: nuevoProducto.Nombre,
        precio: Number(nuevoProducto.Precio),
        descripcion: nuevoProducto.Descripcion,
        disponibilidad: nuevoProducto.Disponibilidad,
        imagenes: nuevoProducto.Imagenes,
      },
    };
  }

  async actualizarProducto(usuarioId: number, productoId: number, actualizarProductoDto: ActualizarProductoDto) {
    const vendedor = await this.vendedorRepository.findByUsuarioId(usuarioId);
    if (!vendedor) {
      throw new ForbiddenException('No eres vendedor');
    }

    const producto = await this.productoRepository.findById(productoId);
    if (!producto || producto.IsDeleted) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (producto.VendedorId !== vendedor.VendedorId) {
      throw new ForbiddenException('No tienes permiso para editar este producto');
    }

    const productoActualizado = await this.productoRepository.update(productoId, actualizarProductoDto);
    if (!productoActualizado) {
      throw new NotFoundException('Error al actualizar el producto');
    }

    return {
      message: 'Producto actualizado exitosamente',
      producto: {
        productoId: productoActualizado.ProductoId,
        vendedorId: productoActualizado.VendedorId,
        categoriaProductoId: productoActualizado.CategoriaProductoId,
        nombre: productoActualizado.Nombre,
        precio: Number(productoActualizado.Precio),
        descripcion: productoActualizado.Descripcion,
        disponibilidad: productoActualizado.Disponibilidad,
        imagenes: productoActualizado.Imagenes,
      },
    };
  }

  async eliminarProducto(usuarioId: number, productoId: number, rol: string) {
    const producto = await this.productoRepository.findById(productoId);
    if (!producto || producto.IsDeleted) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (rol !== 'admin') {
      const vendedor = await this.vendedorRepository.findByUsuarioId(usuarioId);
      if (!vendedor || producto.VendedorId !== vendedor.VendedorId) {
        throw new ForbiddenException('No tienes permiso para eliminar este producto');
      }
    }

    await this.productoRepository.softDelete(productoId);

    return { message: 'Producto eliminado exitosamente' };
  }
}