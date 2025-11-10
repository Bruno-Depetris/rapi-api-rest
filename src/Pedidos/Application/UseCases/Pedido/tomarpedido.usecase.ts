import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import type { ITomarPedidoUseCase } from '../../../Infrastructure/Ports/Inbound/pedidousecase.port';
import type { IRepartidorPort } from '../../../Infrastructure/Ports/Outbound/repartidor.port';
import { PedidoRepository } from '../../../Infrastructure/Persistence/pedido.repository';

@Injectable()
export class TomarPedidoUseCase implements ITomarPedidoUseCase {
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

    if (pedido.Estado !== 'Pendiente') {
      throw new BadRequestException('Este pedido ya no está disponible');
    }

    if (pedido.RepartidorId) {
      throw new BadRequestException('Este pedido ya fue tomado por otro repartidor');
    }

    await this.pedidoRepository.update(pedidoId, {
      RepartidorId: repartidor.repartidorId,
      Estado: 'EnCamino',
    });

    return {
      message: 'Pedido tomado exitosamente',
      pedido: {
        pedidoId: pedido.PedidoId,
        repartidorId: repartidor.repartidorId,
        estado: 'EnCamino',
      },
    };
  }
}