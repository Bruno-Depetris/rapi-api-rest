import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoItem } from '../../Domain/Entities/carritoitem.entity';

@Injectable()
export class CarritoItemRepository {
  constructor(
    @InjectRepository(CarritoItem)
    private readonly repository: Repository<CarritoItem>,
  ) {}

  async create(data: Partial<CarritoItem>): Promise<CarritoItem> {
    const item = this.repository.create(data);
    return await this.repository.save(item);
  }

  async findById(id: number): Promise<CarritoItem | null> {
    return await this.repository.findOne({
      where: { CarritoItemId: id, IsDeleted: false },
      relations: ['carrito', 'producto'],
    });
  }

  async findByCarritoId(carritoId: number): Promise<CarritoItem[]> {
    return await this.repository.find({
      where: { CarritoId: carritoId, IsDeleted: false },
      relations: ['producto'],
    });
  }

  async findByCarritoYProducto(
    carritoId: number,
    productoId: number,
  ): Promise<CarritoItem | null> {
    return await this.repository.findOne({
      where: {
        CarritoId: carritoId,
        ProductoId: productoId,
        IsDeleted: false,
      },
    });
  }

  async update(id: number, data: Partial<CarritoItem>): Promise<CarritoItem | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.update(id, { IsDeleted: true });
  }

  async deleteByCarritoId(carritoId: number): Promise<void> {
    await this.repository.update(
      { CarritoId: carritoId },
      { IsDeleted: true },
    );
  }

  async actualizarCantidad(id: number, cantidad: number, subtotal: number): Promise<void> {
    await this.repository.update(id, {
      Cantidad: cantidad,
      Subtotal: subtotal,
    });
  }

  async countByCarrito(carritoId: number): Promise<number> {
    return await this.repository.count({
      where: { CarritoId: carritoId, IsDeleted: false },
    });
  }

  async sumTotalByCarrito(carritoId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('item')
      .select('SUM(item.Subtotal)', 'total')
      .where('item.CarritoId = :carritoId', { carritoId })
      .andWhere('item.IsDeleted = false')
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }
}