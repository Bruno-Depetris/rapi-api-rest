import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type{ IActualizarMetodoPagoUseCase } from '../../../Infrastructure/Ports/Inbound/metodopagoUseCase.port';
import { MetodoPagoRepository } from '../../../Infrastructure/Persistence/metodopago.repository';
import { ActualizarMetodoPagoDto } from '../../DTOs/actualizarmetodopago.dto';

@Injectable()
export class ActualizarMetodoPagoUseCase implements IActualizarMetodoPagoUseCase {
  constructor(private readonly metodoPagoRepository: MetodoPagoRepository) {}

  async ejecutar(metodoId: number, dto: ActualizarMetodoPagoDto) {
    const metodoPago = await this.metodoPagoRepository.findById(metodoId);
    if (!metodoPago) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    if (dto.Metodo && dto.Metodo !== metodoPago.Metodo) {
      const existe = await this.metodoPagoRepository.findByNombre(dto.Metodo);
      if (existe) {
        throw new ConflictException('Ya existe un método de pago con ese nombre');
      }
    }

    const metodoActualizado = await this.metodoPagoRepository.update(metodoId, dto);

    if (!metodoActualizado) {
      throw new NotFoundException('Error al actualizar el método de pago');
    }

    return {
      message: 'Método de pago actualizado exitosamente',
      metodoPago: {
        metodoId: metodoActualizado.MetodoId,
        metodo: metodoActualizado.Metodo,
      },
    };
  }
}