import { Injectable } from '@nestjs/common';
import type { IObtenerCarritoUseCase } from '../../../Infrastructure/Ports/Inbound/carritoUseCase.port';
import { CarritoRepository } from '../../../Infrastructure/Persistence/carrito.repository';

@Injectable()
export class ObtenerCarritoUseCase implements IObtenerCarritoUseCase {
  constructor(private readonly carritoRepository: CarritoRepository) {}

  async ejecutar(usuarioId: number) {
    let carrito = await this.carritoRepository.findCarritoActivo(usuarioId);

    if (!carrito) {
      carrito = await this.carritoRepository.create({
        UsuarioId: usuarioId,
        Estado: 'Activo',
        Subtotal: 0,
        TotalDescuentos: 0,
        Total: 0,
      });
    }

    return {
      carritoId: carrito.CarritoId,
      usuarioId: carrito.UsuarioId,
      estado: carrito.Estado,
      subtotal: Number(carrito.Subtotal),
      totalDescuentos: Number(carrito.TotalDescuentos),
      total: Number(carrito.Total),
      fechaCreacion: carrito.FechaCreacion,
      items:
        carrito.items?.map((item) => ({
          carritoItemId: item.CarritoItemId,
          productoId: item.ProductoId,
          nombre: item.producto?.Nombre || 'Producto',
          cantidad: item.Cantidad,
          precioUnitario: Number(item.PrecioUnitario),
          subtotal: Number(item.Subtotal),
        })) || [],
      cupones:
        carrito.cupones?.map((cc) => ({
          carritoCuponId: cc.CarritoCuponId,
          codigo: cc.cupon?.Codigo || '',
          descuentoAplicado: Number(cc.DescuentoAplicado),
        })) || [],
    };
  }
}