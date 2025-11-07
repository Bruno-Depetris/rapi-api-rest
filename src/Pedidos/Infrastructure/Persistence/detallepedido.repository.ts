import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetallePedido } from '../../Domain/Entities/detallepedido.entity';

@Injectable()
export class DetallePedidoRepository {
  constructor(
    @InjectRepository(DetallePedido)
    private readonly repository: Repository<DetallePedido>,
  ) {}

  async create(data: Partial<DetallePedido>): Promise<DetallePedido> {
    const detalle = this.repository.create(data);
    return await this.repository.save(detalle);
  }

  async createMultiple(data: Partial<DetallePedido>[]): Promise<DetallePedido[]> {
    const detalles = this.repository.create(data);
    return await this.repository.save(detalles);
  }

  async findById(id: number): Promise<DetallePedido | null> {
    return await this.repository.findOne({
      where: { DetallePedidoId: id, IsDeleted: false },
      relations: ['pedido', 'producto'],
    });
  }

  async findByPedidoId(pedidoId: number): Promise<DetallePedido[]> {
    return await this.repository.find({
      where: { PedidoId: pedidoId, IsDeleted: false },
      relations: ['producto'],
    });
  }

  async findByProductoId(productoId: number): Promise<DetallePedido[]> {
    return await this.repository.find({
      where: { ProductoId: productoId, IsDeleted: false },
      relations: ['pedido'],
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { IsDeleted: true });
  }

  async countByPedido(pedidoId: number): Promise<number> {
    return await this.repository.count({
      where: { PedidoId: pedidoId, IsDeleted: false },
    });
  }

  async sumTotalByPedido(pedidoId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.Subtotal)', 'total')
      .where('detalle.PedidoId = :pedidoId', { pedidoId })
      .andWhere('detalle.IsDeleted = false')
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }
}