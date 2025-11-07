import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import type { IObtenerPedidoUseCase } from '../../../Infrastructure/Ports/Inbound/pedidousecase.port';
import type { IRepartidorPort } from '../../../Infrastructure/Ports/Outbound/repartidor.port';
import type { IVendedorPort } from '../../../Infrastructure/Ports/Outbound/vendedor.port';
import { PedidoRepository } from '../../../Infrastructure/Persistence/pedido.repository';

@Injectable()
export class ObtenerPedidoUseCase implements IObtenerPedidoUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    @Inject('IRepartidorPort')
    private readonly repartidorPort: IRepartidorPort,
    @Inject('IVendedorPort')
    private readonly vendedorPort: IVendedorPort,
  ) {}

  async ejecutar(pedidoId: number, usuarioId: number, rol: string) {
    const pedido = await this.pedidoRepository.findById(pedidoId);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar permisos según rol
    if (rol !== 'admin' && pedido.UsuarioId !== usuarioId) {
      if (rol === 'repartidor') {
        const repartidor = await this.repartidorPort.obtenerPorUsuarioId(usuarioId);
        if (!repartidor || pedido.RepartidorId !== repartidor.repartidorId) {
          throw new ForbiddenException('No tienes permiso para ver este pedido');
        }
      } else if (rol === 'vendedor') {
        const vendedor = await this.vendedorPort.obtenerPorUsuarioId(usuarioId);
        if (!vendedor) {
          throw new ForbiddenException('No eres vendedor');
        }

        const tieneProductos = await this.vendedorPort.validarTieneProductoEnPedido(
          vendedor.vendedorId,
          pedidoId,
        );

        if (!tieneProductos) {
          throw new ForbiddenException('Este pedido no incluye tus productos');
        }
      } else {
        throw new ForbiddenException('No tienes permiso para ver este pedido');
      }
    }

    return {
      pedidoId: pedido.PedidoId,
      usuarioId: pedido.UsuarioId,
      carritoId: pedido.CarritoId,
      repartidorId: pedido.RepartidorId,
      metodoPagoId: pedido.MetodoPagoId,
      estado: pedido.Estado,
      subtotalProductos: Number(pedido.SubtotalProductos),
      totalDescuentos: Number(pedido.TotalDescuentos),
      costoEnvio: Number(pedido.CostoEnvio),
      total: Number(pedido.Total),
      fechaCreacion: pedido.FechaCreacion,
      fechaEntrega: pedido.FechaEntrega,
      resenia: pedido.Resenia,
      metodoPago: pedido.metodoPago
        ? {
            metodoId: pedido.metodoPago.MetodoId,
            metodo: pedido.metodoPago.Metodo,
          }
        : null,
      detalles:
        pedido.detalles?.map((d) => ({
          detallePedidoId: d.DetallePedidoId,
          productoId: d.ProductoId,
          nombreProducto: d.producto?.Nombre || 'Producto',
          cantidad: d.Cantidad,
          precioUnitario: Number(d.PrecioUnitario),
          subtotal: Number(d.Subtotal),
        })) || [],
    };
  }
}