import { Injectable } from '@nestjs/common';
import type { IListarMisPedidosUseCase } from '../../../Infrastructure/Ports/Inbound/pedidousecase.port';
import { PedidoRepository } from '../../../Infrastructure/Persistence/pedido.repository';

@Injectable()
export class ListarMisPedidosUseCase implements IListarMisPedidosUseCase {
  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async ejecutar(usuarioId: number, page: number = 1, limit: number = 10) {
    const pedidos = await this.pedidoRepository.findByUsuarioId(usuarioId);
    const total = await this.pedidoRepository.countByUsuario(usuarioId);

    const inicio = (page - 1) * limit;
    const pedidosPaginados = pedidos.slice(inicio, inicio + limit);

    return {
      data: pedidosPaginados.map((p) => ({
        pedidoId: p.PedidoId,
        estado: p.Estado,
        total: Number(p.Total),
        fechaCreacion: p.FechaCreacion,
        cantidadProductos: p.detalles?.length || 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}