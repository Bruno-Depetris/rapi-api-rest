import { Injectable, NotFoundException } from '@nestjs/common';
import type { IVaciarCarritoUseCase } from '../../../Infrastructure/Ports/Inbound/carritoUseCase.port';
import { CarritoRepository } from '../../../Infrastructure/Persistence/carrito.repository';
import { CarritoItemRepository } from '../../../Infrastructure/Persistence/carritoitem.repository';
import { CarritoCuponRepository } from '../../../Infrastructure/Persistence/carritocupon.repository';

@Injectable()
export class VaciarCarritoUseCase implements IVaciarCarritoUseCase {
  constructor(
    private readonly carritoRepository: CarritoRepository,
    private readonly carritoItemRepository: CarritoItemRepository,
    private readonly carritoCuponRepository: CarritoCuponRepository,
  ) {}

  async ejecutar(usuarioId: number) {
    const carrito = await this.carritoRepository.findCarritoActivo(usuarioId);
    if (!carrito) {
      throw new NotFoundException('No tienes un carrito activo');
    }

    await this.carritoItemRepository.deleteByCarritoId(carrito.CarritoId);

    await this.carritoCuponRepository.deleteByCarritoId(carrito.CarritoId);

    await this.carritoRepository.actualizarTotales(carrito.CarritoId, 0, 0, 0);

    return {
      message: 'Carrito vaciado exitosamente',
    };
  }
}