import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import type{ ICrearCuponUseCase } from '../../../Infrastructure/Ports/Inbound/cuponusecase.port';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';
import { CrearCuponDto } from '../../DTOs/crearcupon.dto';

@Injectable()
export class CrearCuponUseCase implements ICrearCuponUseCase {
  constructor(private readonly cuponRepository: CuponRepository) {}

  async ejecutar(dto: CrearCuponDto) {
    const existe = await this.cuponRepository.existsByCodigo(dto.Codigo);
    if (existe) {
      throw new ConflictException('Ya existe un cupón con ese código');
    }

    if (dto.TipoDescuento === 'porcentaje' && dto.Descuento > 100) {
      throw new BadRequestException('El descuento porcentual no puede ser mayor a 100');
    }

    const nuevoCupon = await this.cuponRepository.create({
      Codigo: dto.Codigo,
      Descuento: dto.Descuento,
      TipoDescuento: dto.TipoDescuento,
      FechaExpiracion: dto.FechaExpiracion,
      UsosMaximos: dto.UsosMaximos,
      UsosActuales: 0,
    });

    return {
      message: 'Cupón creado exitosamente',
      cupon: {
        cuponId: nuevoCupon.CuponId,
        codigo: nuevoCupon.Codigo,
        descuento: Number(nuevoCupon.Descuento),
        tipoDescuento: nuevoCupon.TipoDescuento,
      },
    };
  }
}