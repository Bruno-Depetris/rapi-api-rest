import { Injectable, NotFoundException } from '@nestjs/common';
import type{ IEliminarMetodoPagoUseCase } from '../../../Infrastructure/Ports/Inbound/metodopagoUseCase.port';
import { MetodoPagoRepository } from '../../../Infrastructure/Persistence/metodopago.repository';

@Injectable()
export class EliminarMetodoPagoUseCase implements IEliminarMetodoPagoUseCase {
  constructor(private readonly metodoPagoRepository: MetodoPagoRepository) {}

  async ejecutar(metodoId: number) {
    const metodoPago = await this.metodoPagoRepository.findById(metodoId);
    if (!metodoPago) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    await this.metodoPagoRepository.softDelete(metodoId);

    return {
      message: 'Método de pago eliminado exitosamente',
    };
  }
}