import { Injectable } from '@nestjs/common';
import type{ IListarCuponesActivosUseCase } from '../../../Infrastructure/Ports/Inbound/cuponusecase.port';
import { CuponRepository } from '../../../Infrastructure/Persistence/cupon.repository';

@Injectable()
export class ListarCuponesActivosUseCase implements IListarCuponesActivosUseCase {
  constructor(private readonly cuponRepository: CuponRepository) {}

  async ejecutar() {
    const cupones = await this.cuponRepository.findActivos();

    return cupones.map((c) => ({
      cuponId: c.CuponId,
      codigo: c.Codigo,
      descuento: Number(c.Descuento),
      tipoDescuento: c.TipoDescuento,
      fechaExpiracion: c.FechaExpiracion,
    }));
  }
}