import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { IEliminarItemUseCase } from '../../../Infrastructure/Ports/Inbound/carritoUseCase.port';
import { CarritoRepository } from '../../../Infrastructure/Persistence/carrito.repository';
import { CarritoItemRepository } from '../../../Infrastructure/Persistence/carritoitem.repository';
import { CarritoCuponRepository } from '../../../Infrastructure/Persistence/carritocupon.repository';

@Injectable()
export class EliminarItemUseCase implements IEliminarItemUseCase {
  constructor(
    private readonly carritoRepository: CarritoRepository,
    private readonly carritoItemRepository: CarritoItemRepository,
    private readonly carritoCuponRepository: CarritoCuponRepository,
  ) {}

  async ejecutar(usuarioId: number, carritoItemId: number) {
    const item = await this.carritoItemRepository.findById(carritoItemId);
    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    const carrito = await this.carritoRepository.findById(item.CarritoId);
    if (!carrito || carrito.UsuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para modificar este carrito');
    }

    if (carrito.Estado !== 'Activo') {
      throw new BadRequestException('No puedes modificar un carrito inactivo');
    }

    await this.carritoItemRepository.softDelete(carritoItemId);

    await this.calcularTotales(carrito.CarritoId);

    return {
      message: 'Producto eliminado del carrito',
    };
  }

  private async calcularTotales(carritoId: number): Promise<void> {
    const subtotal = await this.carritoItemRepository.sumTotalByCarrito(carritoId);
    const totalDescuentos = await this.carritoCuponRepository.sumDescuentosByCarrito(carritoId);
    const total = subtotal - totalDescuentos;

    await this.carritoRepository.actualizarTotales(carritoId, subtotal, totalDescuentos, total);
  }
}