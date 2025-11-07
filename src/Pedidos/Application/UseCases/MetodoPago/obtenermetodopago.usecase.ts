import { Injectable, NotFoundException } from '@nestjs/common';
import type{ IObtenerMetodoPagoUseCase } from '../../../Infrastructure/Ports/Inbound/metodopagoUseCase.port';
import { MetodoPagoRepository } from '../../../Infrastructure/Persistence/metodopago.repository';

@Injectable()
export class ObtenerMetodoPagoUseCase implements IObtenerMetodoPagoUseCase {
  constructor(private readonly metodoPagoRepository: MetodoPagoRepository) {}

  async ejecutar(metodoId: number) {
    const metodoPago = await this.metodoPagoRepository.findById(metodoId);
    if (!metodoPago) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    return {
      metodoId: metodoPago.MetodoId,
      metodo: metodoPago.Metodo,
    };
  }
}