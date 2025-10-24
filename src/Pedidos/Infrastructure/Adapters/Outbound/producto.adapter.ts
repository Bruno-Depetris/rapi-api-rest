import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IProductoPort } from '../../Ports/Outbound/producto.port';
import { ProductoRepository } from '../../../../Productos/Repositories/producto.repository';

@Injectable()
export class ProductoAdapter implements IProductoPort {
  constructor(
  @Inject(ProductoRepository)
  private readonly productoRepository: ProductoRepository
) {}

  async validarExiste(productoId: number): Promise<boolean> {
    const producto = await this.productoRepository.findById(productoId);
    return !!producto;
  }

  async obtenerDatos(productoId: number) {
    const producto = await this.productoRepository.findById(productoId);
    if (!producto) {
      return null;
    }

    return {
      productoId: producto.ProductoId,
      nombre: producto.Nombre,
      precio: Number(producto.Precio),
      disponibilidad: producto.Disponibilidad,
    };
  }

  async validarStock(productoId: number, cantidad: number): Promise<boolean> {
    const producto = await this.productoRepository.findById(productoId);
    if (!producto) {
      return false;
    }

    return producto.Disponibilidad >= cantidad;
  }
}