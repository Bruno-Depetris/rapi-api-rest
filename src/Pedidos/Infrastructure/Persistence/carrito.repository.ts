import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from '../../Domain/Entities/carrito.entity';

@Injectable()
export class CarritoRepository {
  constructor(
    @InjectRepository(Carrito)
    private readonly repository: Repository<Carrito>,
  ) {}

  async create(data: Partial<Carrito>): Promise<Carrito> {
    const carrito = this.repository.create(data);
    return await this.repository.save(carrito);
  }

  async findById(id: number): Promise<Carrito | null> {
    return await this.repository.findOne({
      where: { CarritoId: id, IsDeleted: false },
      relations: ['items', 'items.producto', 'cupones', 'cupones.cupon'],
    });
  }

  async findByUsuarioId(usuarioId: number): Promise<Carrito[]> {
    return await this.repository.find({
      where: { UsuarioId: usuarioId, IsDeleted: false },
      relations: ['items', 'cupones'],
      order: { FechaCreacion: 'DESC' },
    });
  }

  async findCarritoActivo(usuarioId: number): Promise<Carrito | null> {
    return await this.repository.findOne({
      where: { 
        UsuarioId: usuarioId, 
        Estado: 'Activo',
        IsDeleted: false 
      },
      relations: ['items', 'items.producto', 'cupones', 'cupones.cupon'],
    });
  }

  async findByEstado(estado: string): Promise<Carrito[]> {
    return await this.repository.find({
      where: { Estado: estado, IsDeleted: false },
      relations: ['items'],
    });
  }

  async update(id: number, data: Partial<Carrito>): Promise<Carrito | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { IsDeleted: true });
  }

  async convertirACompra(id: number): Promise<void> {
    await this.repository.update(id, {
      Estado: 'Convertido',
      FechaConversion: new Date(),
    });
  }

  async actualizarTotales(
    id: number,
    subtotal: number,
    totalDescuentos: number,
    total: number,
  ): Promise<void> {
    await this.repository.update(id, {
      Subtotal: subtotal,
      TotalDescuentos: totalDescuentos,
      Total: total,
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
}