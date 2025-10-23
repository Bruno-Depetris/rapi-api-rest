import { Injectable } from '@nestjs/common';
import type{ IListarMetodosPagoUseCase } from '../../../Infrastructure/Ports/Inbound/metodopagoUseCase.port';
import { MetodoPagoRepository } from '../../../Infrastructure/Persistence/metodopago.repository';


@Injectable()
export class ListarMetodosPagoUseCase implements IListarMetodosPagoUseCase {
  constructor(private readonly metodoPagoRepository: MetodoPagoRepository) {}

  async ejecutar() {
    const metodos = await this.metodoPagoRepository.findAll();

    return metodos.map((m) => ({
      metodoId: m.MetodoId,
      metodo: m.Metodo,
    }));
  }
}