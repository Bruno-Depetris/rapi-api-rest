import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IListarPedidosRepartidorUseCase } from '../../../Infrastructure/Ports/Inbound/pedidousecase.port';
import type { IRepartidorPort } from '../../../Infrastructure/Ports/Outbound/repartidor.port';
import { PedidoRepository } from '../../../Infrastructure/Persistence/pedido.repository';

@Injectable()
export class ListarPedidosRepartidorUseCase implements IListarPedidosRepartidorUseCase {
  constructor(
    @Inject('IRepartidorPort')
    private readonly repartidorPort: IRepartidorPort,
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async ejecutar(usuarioId: number, estado: string = 'Pendiente', page: number = 1, limit: number = 10) {

    const repartidor = await this.repartidorPort.obtenerPorUsuarioId(usuarioId);
    if (!repartidor) {
      throw new NotFoundException('No eres repartidor');
    }

    const pedidosQuery = this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .where('pedido.IsDeleted = false')
      .andWhere('pedido.Estado = :estado', { estado })
      .andWhere('pedido.RepartidorId IS NULL'); 

    const pedidos = await pedidosQuery
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('pedido.FechaCreacion', 'DESC')
      .getMany();

    const total = await pedidosQuery.getCount();

    return {
      data: pedidos.map((p) => ({
        pedidoId: p.PedidoId,
        estado: p.Estado,
        total: Number(p.Total),
        fechaCreacion: p.FechaCreacion,
        misProductos: p.detalles?.map((d) => ({
          productoId: d.ProductoId,
          nombre: d.producto?.Nombre || 'Producto',
          cantidad: d.Cantidad,
          subtotal: Number(d.Subtotal),
        })) || [],
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
