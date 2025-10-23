import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../../Domain/Entities/pedido.entity';

@Injectable()
export class PedidoRepository {
  constructor(
    @InjectRepository(Pedido)
    private readonly repository: Repository<Pedido>,
  ) {}

  async create(data: Partial<Pedido>): Promise<Pedido> {
    const pedido = this.repository.create(data);
    return await this.repository.save(pedido);
  }

  async findById(id: number): Promise<Pedido | null> {
    return await this.repository.findOne({
      where: { PedidoId: id, IsDeleted: false },
      relations: ['detalles', 'detalles.producto', 'metodoPago', 'carrito'],
    });
  }

  async findByUsuarioId(usuarioId: number): Promise<Pedido[]> {
    return await this.repository.find({
      where: { UsuarioId: usuarioId, IsDeleted: false },
      relations: ['detalles', 'metodoPago'],
      order: { FechaCreacion: 'DESC' },
    });
  }

  async findByRepartidorId(repartidorId: number): Promise<Pedido[]> {
    return await this.repository.find({
      where: { RepartidorId: repartidorId, IsDeleted: false },
      relations: ['detalles'],
      order: { FechaCreacion: 'DESC' },
    });
  }

  async findByEstado(estado: string): Promise<Pedido[]> {
    return await this.repository.find({
      where: { Estado: estado, IsDeleted: false },
      relations: ['detalles'],
      order: { FechaCreacion: 'ASC' },
    });
  }

  async update(id: number, data: Partial<Pedido>): Promise<Pedido | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async actualizarEstado(id: number, estado: string): Promise<void> {
    await this.repository.update(id, { Estado: estado });
  }

  async asignarRepartidor(id: number, repartidorId: number): Promise<void> {
    await this.repository.update(id, { RepartidorId: repartidorId });
  }

  async marcarEntregado(id: number): Promise<void> {
    await this.repository.update(id, {
      Estado: 'Entregado',
      FechaEntrega: new Date(),
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { IsDeleted: true });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Pedido[]> {
    return await this.repository.find({
      where: { IsDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['detalles', 'metodoPago'],
      order: { FechaCreacion: 'DESC' },
    });
  }

  async count(): Promise<number> {
    return await this.repository.count({
      where: { IsDeleted: false },
    });
  }

  async countByUsuario(usuarioId: number): Promise<number> {
    return await this.repository.count({
      where: { UsuarioId: usuarioId, IsDeleted: false },
    });
  }

  async countByEstado(estado: string): Promise<number> {
    return await this.repository.count({
      where: { Estado: estado, IsDeleted: false },
    });
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}