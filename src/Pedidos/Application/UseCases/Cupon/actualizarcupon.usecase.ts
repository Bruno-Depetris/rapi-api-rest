import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { IActualizarCuponUseCase } from '../../../Infrastructure/Ports/Inbound/cuponusecase.port';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';
import { ActualizarCuponDto } from '../../DTOs/actualizarcupon.dto';

@Injectable()
export class ActualizarCuponUseCase implements IActualizarCuponUseCase {
  constructor(private readonly cuponRepository: CuponRepository) {}

  async ejecutar(cuponId: number, dto: ActualizarCuponDto) {
    const cupon = await this.cuponRepository.findById(cuponId);
    if (!cupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    if (dto.Codigo && dto.Codigo !== cupon.Codigo) {
      const existe = await this.cuponRepository.existsByCodigo(dto.Codigo);
      if (existe) {
        throw new ConflictException('Ya existe un cupón con ese código');
      }
    }

    const cuponActualizado = await this.cuponRepository.update(cuponId, dto);

    if (!cuponActualizado) {
      throw new NotFoundException('Error al actualizar el cupón');
    }

    return {
      message: 'Cupón actualizado exitosamente',
      cupon: {
        cuponId: cuponActualizado.CuponId,
        codigo: cuponActualizado.Codigo,
        descuento: Number(cuponActualizado.Descuento),
        tipoDescuento: cuponActualizado.TipoDescuento,
      },
    };
  }
}