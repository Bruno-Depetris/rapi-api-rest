import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IRemoverCuponUseCase } from '../../../Infrastructure/Ports/Inbound/carritoUseCase.port';
import { CarritoRepository } from '../../../Infrastructure/Persistence/carrito.repository';
import { CarritoCuponRepository } from '../../../Infrastructure/Persistence/carritocupon.repository';
import { CarritoItemRepository } from '../../../Infrastructure/Persistence/carritoitem.repository';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';

@Injectable()
export class RemoverCuponUseCase implements IRemoverCuponUseCase {
  constructor(
    private readonly carritoRepository: CarritoRepository,
    private readonly carritoCuponRepository: CarritoCuponRepository,
    private readonly carritoItemRepository: CarritoItemRepository,
    private readonly cuponRepository: CuponRepository,
  ) {}

  async ejecutar(usuarioId: number, carritoCuponId: number) {
    const carritoCupon = await this.carritoCuponRepository.findById(carritoCuponId);
    if (!carritoCupon) {
      throw new NotFoundException('Cupón no encontrado en el carrito');
    }

    // Verificar que el carrito pertenece al usuario
    const carrito = await this.carritoRepository.findById(carritoCupon.CarritoId);
    if (!carrito || carrito.UsuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para modificar este carrito');
    }

    // Decrementar uso del cupón
    await this.cuponRepository.decrementarUso(carritoCupon.CuponId);

    // Eliminar cupón del carrito
    await this.carritoCuponRepository.softDelete(carritoCuponId);

    // Recalcular totales
    await this.calcularTotales(carrito.CarritoId);

    const carritoActualizado = await this.carritoRepository.findById(carrito.CarritoId);

    return {
      message: 'Cupón removido',
      carrito: {
        totalDescuentos: Number(carritoActualizado!.TotalDescuentos),
        total: Number(carritoActualizado!.Total),
      },
    };
  }

  private async calcularTotales(carritoId: number): Promise<void> {
    const subtotal = await this.carritoItemRepository.sumTotalByCarrito(carritoId);
    const totalDescuentos = await this.carritoCuponRepository.sumDescuentosByCarrito(carritoId);
    const total = subtotal - totalDescuentos;

    await this.carritoRepository.actualizarTotales(carritoId, subtotal, totalDescuentos, total);
  }
}