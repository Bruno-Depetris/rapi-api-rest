import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import type { IEntregarPedidoUseCase } from '../../../Infrastructure/Ports/Inbound/pedidousecase.port';
import type { IRepartidorPort } from '../../../Infrastructure/Ports/Outbound/repartidor.port';
import { PedidoRepository } from '../../../Infrastructure/Persistence/pedido.repository';

@Injectable()
export class EntregarPedidoUseCase implements IEntregarPedidoUseCase {
  constructor(
    @Inject('IRepartidorPort')
    private readonly repartidorPort: IRepartidorPort,
    private readonly pedidoRepository: PedidoRepository,
  ) {}

  async ejecutar(pedidoId: number, usuarioId: number) {
    const repartidor = await this.repartidorPort.obtenerPorUsuarioId(usuarioId);
    if (!repartidor) {
      throw new NotFoundException('No eres repartidor');
    }

    const pedido = await this.pedidoRepository.findById(pedidoId);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.RepartidorId !== repartidor.repartidorId) {
      throw new ForbiddenException('Este pedido no te pertenece');
    }

    if (pedido.Estado === 'Entregado') {
      throw new BadRequestException('El pedido ya fue entregado');
    }

    await this.pedidoRepository.marcarEntregado(pedidoId);

    const pedidoActualizado = await this.pedidoRepository.findById(pedidoId);

    return {
      message: 'Pedido marcado como entregado',
      pedido: {
        pedidoId: pedidoActualizado!.PedidoId,
        estado: pedidoActualizado!.Estado,
        fechaEntrega: pedidoActualizado!.FechaEntrega!,
      },
    };
  }
}