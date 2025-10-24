import { Injectable, Inject} from '@nestjs/common';
import type { IVendedorPort } from '../../Ports/Outbound/vendedor.port';
import { VendedorRepository } from '../../../../Usuarios/Repositories/vendedor.repository';
import { PedidoRepository } from '../../Persistence/pedido.repository';

@Injectable()
export class VendedorAdapter implements IVendedorPort {
  constructor(
    @Inject(VendedorRepository) 
    private readonly vendedorRepository: VendedorRepository,
    private readonly pedidoRepository: PedidoRepository, 
  ) {}

  async obtenerPorUsuarioId(usuarioId: number) {
    const vendedor = await this.vendedorRepository.findByUsuarioId(usuarioId);
    if (!vendedor) {
      return null;
    }

    return {
      vendedorId: vendedor.VendedorId,
      negocioId: vendedor.NegocioId || 0,
    };
  }

  async validarTieneProductoEnPedido(vendedorId: number, pedidoId: number): Promise<boolean> {
    const pedido = await this.pedidoRepository.findById(pedidoId);
    if (!pedido) {
      return false;
    }

    return pedido.detalles?.some((d) => d.producto?.VendedorId === vendedorId) || false;
  }
}