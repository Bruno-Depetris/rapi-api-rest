import { Injectable } from '@nestjs/common';
import type{ IListarCuponesUseCase } from '../../../Infrastructure/Ports/Inbound/cuponusecase.port';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';

@Injectable()
export class ListarCuponesUseCase implements IListarCuponesUseCase {
  constructor(private readonly cuponRepository: CuponRepository) {}

  async ejecutar(page: number = 1, limit: number = 10) {
    const cupones = await this.cuponRepository.findAll(page, limit);
    const total = await this.cuponRepository.count();

    return {
      data: cupones.map((c) => ({
        cuponId: c.CuponId,
        codigo: c.Codigo,
        descuento: Number(c.Descuento),
        tipoDescuento: c.TipoDescuento,
        fechaExpiracion: c.FechaExpiracion,
        usosMaximos: c.UsosMaximos,
        usosActuales: c.UsosActuales,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}