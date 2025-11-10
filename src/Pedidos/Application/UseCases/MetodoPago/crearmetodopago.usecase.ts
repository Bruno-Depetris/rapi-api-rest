import { Injectable, ConflictException } from '@nestjs/common';
import type{ ICrearMetodoPagoUseCase } from '../../../Infrastructure/Ports/Inbound/metodopagoUseCase.port'
import { MetodoPagoRepository } from '../../../Infrastructure/Persistence/metodopago.repository';
import { CrearMetodoPagoDto } from '../../DTOs/crearmetodopago.dto';

@Injectable()
export class CrearMetodoPagoUseCase implements ICrearMetodoPagoUseCase {
  constructor(private readonly metodoPagoRepository: MetodoPagoRepository) {}

  async ejecutar(dto: CrearMetodoPagoDto) {
    const existe = await this.metodoPagoRepository.existsByNombre(dto.Metodo);
    if (existe) {
      throw new ConflictException('Ya existe un método de pago con ese nombre');
    }

    const nuevoMetodo = await this.metodoPagoRepository.create({
      Metodo: dto.Metodo,
    });

    return {
      message: 'Método de pago creado exitosamente',
      metodoPago: {
        metodoId: nuevoMetodo.MetodoId,
        metodo: nuevoMetodo.Metodo,
      },
    };
  }
}