import { Injectable, NotFoundException } from '@nestjs/common';
import type{ IEliminarCuponUseCase } from '../../../Infrastructure/Ports/Inbound/cuponusecase.port';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';

@Injectable()
export class EliminarCuponUseCase implements IEliminarCuponUseCase {
  constructor(private readonly cuponRepository: CuponRepository) {}

  async ejecutar(cuponId: number) {
    const cupon = await this.cuponRepository.findById(cuponId);
    if (!cupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    await this.cuponRepository.softDelete(cuponId);

    return {
      message: 'Cupón eliminado exitosamente',
    };
  }
}