import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { ICancelarPedidoUseCase } from '../../../Infrastructure/Ports/Inbound/pedidousecase.port';
import { PedidoRepository } from '../../../Infrastructure/Persistence/pedido.repository';

@Injectable()
export class CancelarPedidoUseCase implements ICancelarPedidoUseCase {
  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async ejecutar(pedidoId: number, usuarioId: number, rol: string) {
    const pedido = await this.pedidoRepository.findById(pedidoId);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (rol !== 'admin' && pedido.UsuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para cancelar este pedido');
    }

    if (['EnCamino', 'Entregado'].includes(pedido.Estado)) {
      throw new BadRequestException('No puedes cancelar un pedido en camino o entregado');
    }

    await this.pedidoRepository.actualizarEstado(pedidoId, 'Cancelado');

    return {
      message: 'Pedido cancelado exitosamente',
    };
  }
}