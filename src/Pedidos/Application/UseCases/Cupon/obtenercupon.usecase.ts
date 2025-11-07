import { Injectable, NotFoundException } from '@nestjs/common';
import type{ IObtenerCuponUseCase } from '../../../Infrastructure/Ports/Inbound/cuponusecase.port';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';

@Injectable()
export class ObtenerCuponUseCase implements IObtenerCuponUseCase {
  constructor(private readonly cuponRepository: CuponRepository) {}

  async ejecutar(cuponId: number) {
    const cupon = await this.cuponRepository.findById(cuponId);
    if (!cupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    return {
      cuponId: cupon.CuponId,
      codigo: cupon.Codigo,
      descuento: Number(cupon.Descuento),
      tipoDescuento: cupon.TipoDescuento,
      fechaExpiracion: cupon.FechaExpiracion,
      usosMaximos: cupon.UsosMaximos,
      usosActuales: cupon.UsosActuales,
    };
  }
}