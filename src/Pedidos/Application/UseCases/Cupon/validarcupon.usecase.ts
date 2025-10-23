import { Injectable } from '@nestjs/common';
import type{ IValidarCuponUseCase } from '../../../Infrastructure/Ports/Inbound/cuponusecase.port';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';

@Injectable()
export class ValidarCuponUseCase implements IValidarCuponUseCase {
  constructor(private readonly cuponRepository: CuponRepository) {}

  async ejecutar(codigo: string) {
    const cupon = await this.cuponRepository.findByCodigo(codigo);

    if (!cupon) {
      return {
        valido: false,
        mensaje: 'Cupón no encontrado',
      };
    }

    // Verificar expiración
    if (cupon.FechaExpiracion && new Date(cupon.FechaExpiracion) < new Date()) {
      return {
        valido: false,
        mensaje: 'El cupón ha expirado',
      };
    }

    // Verificar usos
    if (cupon.UsosMaximos && cupon.UsosActuales >= cupon.UsosMaximos) {
      return {
        valido: false,
        mensaje: 'El cupón ha alcanzado su límite de usos',
      };
    }

    return {
      valido: true,
      cupon: {
        cuponId: cupon.CuponId,
        codigo: cupon.Codigo,
        descuento: Number(cupon.Descuento),
        tipoDescuento: cupon.TipoDescuento,
      },
    };
  }
}