import { Injectable, NotFoundException } from '@nestjs/common';
import type { IListarPedidosVendedorUseCase } from '../../../Infrastructure/Ports/Inbound/pedidousecase.port';
import type { IVendedorPort } from '../../../Infrastructure/Ports/Outbound/vendedor.port';
import { PedidoRepository } from '../../../Infrastructure/Persistence/pedido.repository';

@Injectable()
export class ListarPedidosVendedorUseCase implements IListarPedidosVendedorUseCase {
  constructor(
    private readonly vendedorPort: IVendedorPort,
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async ejecutar(usuarioId: number, estado?: string, page: number = 1, limit: number = 10) {
    const vendedor = await this.vendedorPort.obtenerPorUsuarioId(usuarioId);
    if (!vendedor) {
      throw new NotFoundException('No eres vendedor');
    }

    // Buscar pedidos que incluyan productos del vendedor
    const pedidosQuery = this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .where('producto.VendedorId = :vendedorId', { vendedorId: vendedor.vendedorId })
      .andWhere('pedido.IsDeleted = false');

    if (estado) {
      pedidosQuery.andWhere('pedido.Estado = :estado', { estado });
    }

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
        misProductos:
          p.detalles
            ?.filter((d) => d.producto?.VendedorId === vendedor.vendedorId)
            .map((d) => ({
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